import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config()

const botToken =  process.env.TOKEN ?? '';
console.log('botToken ',botToken)
const bot = new Telegraf(botToken);

bot.start((ctx) => ctx.reply('Бот запущен!'));

bot.command('help', (ctx) => ctx.reply('помощи нет'))

bot.launch();

console.log('Бот запущен и готов к работе!');
