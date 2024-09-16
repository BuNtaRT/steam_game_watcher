import { DBType, GameRecordType } from "../Database/types";
import * as cheerio from "cheerio";

export const parseAndAddPage = (
  pageString: string,
  iterationId: number,
  db: DBType<GameRecordType>,
) => {
  const page = cheerio.load(pageString);

  const entities = page(".search_result_row");
  console.log(entities.length + " hits");

  entities.each((index, element) => {
    const appId = Number(page(element).data("ds-appid"));

    const id = isNaN(appId) ? 0 : appId;
    db.createOrUpdate(id, iterationId);
  });
};
