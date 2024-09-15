import * as fs from "node:fs";
import { DBRecordType } from "./types";

export const getDB = <T>(path: string, initialValue?: DBRecordType<T>) => {
  let db = {} as DBRecordType<T>;

  const readDb = () => {
    if (fs.existsSync(path)) {
      const fileContent = fs.readFileSync(path, "utf-8").split("\n");
      if (fileContent.length) {
        for (const item of fileContent) {
          if (item) {
            const parsed = JSON.parse(item);
            Object.assign(db, parsed);
          }
        }
      } else if (initialValue) db = initialValue;
    }
  };
  readDb();

  return {
    createOrUpdate: (id: number, entity: T) => {
      db[id] = entity;
    },
    remove: (id: number) => {
      db[id] = undefined as T;
    },
    get: (id: number) => {
      return db[id];
    },
    read: () => {
      readDb();
    },
    write: () => {
      console.log("save");
      fs.writeFileSync(path, "");

      Object.keys(db).forEach((key) => {
        const value = db[Number(key)];
        const jsonString = JSON.stringify({ [key]: value });
        fs.appendFileSync(path, jsonString + "\n");
      });
    },
    where: (condition: (entity: T) => boolean) => {
      const response: T[] = [];
      Object.keys(db).forEach((key) => {
        const value = db[Number(key)];
        if (condition(value)) response.push(value);
      });

      return response;
    },
  };
};
