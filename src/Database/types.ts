import { getDB } from "./Database.js";

export type GameRecordType = {
  id: number;
  link: string;
  price: number;
  isOnMarket: number;
};

export type DBRecordType<T> = { [key: number]: T };
export type DBType<T> = ReturnType<typeof getDB<T>>;
