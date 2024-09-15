import { Telegraf } from "telegraf";
import { DBType, GameRecordType } from "../Database/types";
import { AxiosInstance } from "axios";
import { delay } from "../utils/Delay";
import { getAllGames } from "./GetAllGames";
import { sendGameToBot } from "../Bot/SendGameToBot";
import { sendError } from "../Bot/SendError";

const CRITICAL = Number(process.env.CRITICAL_COUNT ?? 1);
const COOLDOWN = Number(process.env.COOLDOWN_MIN ?? 10);
let errorCount = 0;

export const steamWatcher = async (
  db: DBType<GameRecordType>,
  bot: Telegraf,
  client: AxiosInstance,
) => {
  while (true) {
    try {
      // ------------------------------ Инициализация (автоматическое проставление кук)
      await client.get("https://store.steampowered.com/search/");
      await delay(5000);

      const timestampIteration = new Date().getTime();
      console.log("итерация началась, опять работать >:(");

      await getAllGames(client, db, timestampIteration);

      const deletedGames = db.where(
        ({ isOnMarket }) => timestampIteration !== isOnMarket,
      );
      if (deletedGames.length) {
        for (const game of deletedGames) {
          await needExit(bot);

          const complete = await sendGameToBot(game, bot);
          if (complete) db.remove(game.id);
          else errorCount += 1;
        }
      }

      db.write();

      console.log("итерация закончилась, чилю ~(><)~");
      await delay(1000 * 60 * COOLDOWN);
    } catch (e) {
      await sendError(e, bot);
      break;
    }
  }
};

const needExit = async (bot: Telegraf) => {
  if (CRITICAL < errorCount) {
    await sendError(
      `Множество ошибок (${errorCount}) я устал, закрываюсь...`,
      bot,
    );
    process.exit(1);
  }
};
