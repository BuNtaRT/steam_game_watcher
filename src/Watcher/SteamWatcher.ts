import { Telegraf } from "telegraf";
import { DBType, GameRecordType } from "../Database/types";
import { AxiosInstance } from "axios";
import * as cheerio from "cheerio";

const PAGE_SIZE = 100;

export const steamWatcher = async (
  db: DBType<GameRecordType>,
  bot: Telegraf,
  client: AxiosInstance,
) => {
  // ------------------------------ Инициализация (автоматическое проставление кук)

  while (true) {
    try {
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
          const complete = await sendGameToBot(game, bot);
          if (complete) db.remove(game.id);
        }
      }

      db.write();

      console.log("итерация закончилась, чилим ");
      await delay(1000 * 60 * 10);
    } catch (e) {
      console.error(e);

      await bot.telegram.sendMessage(
        "435903139",
        `Ошибка ${JSON.stringify(e)}`,
      );
      break;
    }
  }
};

const sendGameToBot = async (game: GameRecordType, bot: Telegraf) => {
  try {
    await bot.telegram.sendMessage(
      "435903139",
      `Игра удалена из steam!
последняя цена: ${game.price} р 
      
${game.link} 
      `,
    );
    return true;
  } catch (e) {
    console.log("e ", e);
    await bot.telegram.sendMessage("435903139", `Ошибка ${JSON.stringify(e)}`);
    return false;
  }
};

const getAllGames = async (
  client: AxiosInstance,
  db: DBType<GameRecordType>,
  timestampIteration: number,
) => {
  let startIndex = 0;
  let totalCount = 100;

  do {
    await delay(2000);
    const page = await getNexPageData(client, startIndex);
    parseAndAddPage(page.content, timestampIteration, db);

    db.write();

    totalCount = page.total;
    startIndex += PAGE_SIZE;
    console.log("прогресс --- ", startIndex, " из ", totalCount);
  } while (startIndex < totalCount);
};

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getNexPageData = async (
  client: AxiosInstance,
  startIndex: number,
): Promise<ParsePageReturnType> => {
  const data = (
    await client.get(
      `https://store.steampowered.com/search/results/?query&start=${startIndex}&count=${PAGE_SIZE}&dynamic_data=&force_infinite=1&category1=998&category3=2&os=win&supportedlang=english&hidef2p=1&ndl=1&infinite=1`,
    )
  ).data as ResponseSteamType;

  return { content: data.results_html, total: data.total_count };
};

const parseAndAddPage = (
  pageString: string,
  iterationId: number,
  db: DBType<GameRecordType>,
) => {
  const page = cheerio.load(pageString);

  const results: GameRecordType[] = [];

  page(".search_result_row").each((index, element) => {
    const link = page(element).attr("href") ?? "empty";
    const appId = Number(page(element).data("ds-appid"));
    const priceText = page(element).find(".discount_final_price").text();

    const price = parseFloat(priceText.replace(/[^\d]/g, ""));

    const id = isNaN(appId) ? 0 : appId;
    db.createOrUpdate(id, {
      id,
      link: link,
      price: price,
      isOnMarket: iterationId,
    });
  });
};

type ParsePageReturnType = {
  content: string;
  total: number;
};

type ResponseSteamType = {
  results_html: string;
  total_count: number;
  start: number;
};
