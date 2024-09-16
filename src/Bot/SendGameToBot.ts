import { Telegraf } from "telegraf";
import { FullGameType } from "../Watcher/GetFullGame.js";
import fs from "node:fs";

export const sendGameToBot = async (game: FullGameType, bot: Telegraf) => {
  let ids;
  if (fs.existsSync("chatsIds.txt"))
    ids = fs.readFileSync("chatsIds.txt", "utf-8").split(",");
  else ids = ["435903139"];

  const { name, score, link, price, categories, recomendations, isFree } = game;
  const message = `Игра удалена из steam!
---${name}---
-→ последняя цена: ${isFree ? "бесплатно" : price}
${score ? `-→ метакритик: ${score}\n` : ""}-→ положительных отзывов: ${recomendations}
---категории---- 
${categories}

${link}`;

  ids.forEach((id) => {
    bot.telegram.sendMessage(id, message);
  });
};
