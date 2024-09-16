import { getDB } from "./Database.js";

export type GameRecordType = number;

export type DBRecordType<T> = { [key: number]: T };
export type DBType<T> = ReturnType<typeof getDB<T>>;
