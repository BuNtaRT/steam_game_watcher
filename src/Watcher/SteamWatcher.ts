import { Telegraf } from "telegraf";
import { DBType, GameRecordType } from "../Database/types";
import { AxiosInstance } from "axios";
import { delay } from "../utils/Delay.js";
import { sendGameToBot } from "../Bot/SendGameToBot.js";
import { sendError } from "../Bot/SendError.js";
import { getFullGame } from "./GetFullGame.js";
import { getAllGames } from "./GetAllGames.js";
import { COOLDOWN, CRITICAL } from "../index.js";

let errorCount = 0;

export const steamWatcher = async (
  db: DBType<GameRecordType>,
  bot: Telegraf,
  client: AxiosInstance,
) => {
  console.log(CRITICAL);
  while (true) {
    try {
      // ------------------------------ Инициализация (автоматическое проставление кук)
      await client.get("https://store.steampowered.com/search/");
      await delay(5000);

      const timestampIteration = new Date().getTime();
      console.log("итерация началась, опять работать >:(");

      await getAllGames(client, db, timestampIteration);

      const deletedGames = db.where(
        (gameUpdateTime) => gameUpdateTime !== timestampIteration,
      );
      if (deletedGames.length) {
        for (const game of deletedGames) {
          await needExit(bot);

          try {
            const fullGame = await getFullGame(client, game);
            await sendGameToBot(fullGame, bot);
            db.remove(game);
          } catch (e) {
            errorCount += 1;
            await sendError(e, bot);
          }
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
