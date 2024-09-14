import { Telegraf } from "telegraf";
import * as fs from "node:fs";

export const createBot = () => {
  const botToken = process.env.TOKEN ?? "";
  const bot = new Telegraf(botToken);

  bot.command("help", (ctx: { reply: (arg0: string) => any }) => {
    ctx.reply("помощи нет");
  });
  bot.start((ctx) => {
    ctx.reply("Welcum");
    fs.appendFile("chatsIds.txt", ctx.from.id + ",", function (err) {
      if (err) return console.log(err);
      console.log("done");
    });
  });

  bot.launch();

  return bot;
};
