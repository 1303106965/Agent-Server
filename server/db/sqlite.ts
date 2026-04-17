import Database from 'better-sqlite3'

export const db = new Database('data.db')

// 初始化
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  age INTEGER
);
`)

// 初始化数据（避免重复插）
const row = db.prepare('SELECT * FROM users WHERE name=?').get('张三')

if (!row) {
  db.prepare('INSERT INTO users (name, age) VALUES (?, ?)').run('张三', 18)
}