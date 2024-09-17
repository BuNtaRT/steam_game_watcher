import * as dotenv from "dotenv";
import { getDB } from "./Database/Database.js";
import { GameRecordType } from "./Database/types";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import axios from "axios";
import { steamWatcher } from "./Watcher/SteamWatcher.js";
import { createBot } from "./Bot/Bot.js";

dotenv.config();

// ------------------------------ Bot

const bot = createBot();

// ------------------------------ Database

const db = getDB<GameRecordType>("db/db.json");
// ------------------------------ Axios

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

// ------------------------------ Watch
await steamWatcher(db, bot, client);

console.log("Started");
