import { GameRecordType } from "../Database/types";
import { Telegraf } from "telegraf";
import { sendError } from "./SendError";

export const sendGameToBot = async (game: GameRecordType, bot: Telegraf) => {
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
    await sendError(e, bot);
    return false;
  }
};
