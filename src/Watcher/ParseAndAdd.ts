import { DBType, GameRecordType } from "../Database/types";
import * as cheerio from "cheerio";

export const parseAndAddPage = (
  pageString: string,
  iterationId: number,
  db: DBType<GameRecordType>,
) => {
  const page = cheerio.load(pageString);

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
