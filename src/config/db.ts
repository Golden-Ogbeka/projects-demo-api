import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SQLITE_FILE_NAME } from "./constants.js";

const dataDirectory = path.resolve(process.cwd(), "data");
const databasePath = path.join(dataDirectory, SQLITE_FILE_NAME);

fs.mkdirSync(dataDirectory, { recursive: true });

export const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const getDatabasePath = () => databasePath;
