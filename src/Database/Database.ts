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
      console.log(`read < ${fileContent.length} lines`);
    } else {
      fs.mkdir(path.split("/")[0], () => {
        fs.writeFileSync(path, "");
      });
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
      fs.writeFileSync(path, "");

      Object.keys(db).forEach((key) => {
        const value = db[Number(key)];
        const jsonString = JSON.stringify({ [key]: value });
        fs.appendFileSync(path, jsonString + "\n");
      });
      console.log(`write > ${Object.keys(db).length} strings`);
    },
    where: (condition: (entity: T) => boolean) => {
      const response: T[] = [];
      Object.keys(db).forEach((key) => {
        const value = db[Number(key)];
        if (condition(value)) response.push(value);
      });

      return response;
    },
    length: () => {
      return Object.keys(db).length;
    },
  };
};
