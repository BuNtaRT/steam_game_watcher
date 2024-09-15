import { Telegraf } from "telegraf";

export const sendError = async <T>(e: T, bot: Telegraf) => {
  console.error(e);

  await bot.telegram.sendMessage(
    "435903139",
    `Ошибка!
${JSON.stringify(e)}`,
  );
};
