import { AxiosInstance } from "axios";
import { DBType, GameRecordType } from "../Database/types";
import { delay } from "../utils/Delay.js";
import { parseAndAddPage } from "./ParseAndAdd.js";
import { TICK } from "../index.js";

const PAGE_SIZE = 100;

// ------------------------------ Получение всех игр

export const getAllGames = async (
  client: AxiosInstance,
  db: DBType<GameRecordType>,
  timestampIteration: number,
) => {
  let startIndex = 0;
  let totalCount = 100;

  do {
    await delay(TICK * 1000);
    try {
      const page = await getNexPageData(client, startIndex);
      parseAndAddPage(page.content, timestampIteration, db);

      totalCount = page.total;
      startIndex += PAGE_SIZE;
    } catch (e) {
      console.error("ошибка ", e);
    }

    console.log("прогресс --- ", startIndex, " из ", totalCount);
  } while (startIndex < totalCount);
};

// ------------------------------ Получение след страницы

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

// ------------------------------ Типы

type ParsePageReturnType = {
  content: string;
  total: number;
};

type ResponseSteamType = {
  results_html: string;
  total_count: number;
  start: number;
};
