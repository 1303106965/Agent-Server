import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * SQLite 数据库实例
 */
export async function getDb() {

  return open({
    filename: "./data.db",
    driver: sqlite3.Database
  });

}