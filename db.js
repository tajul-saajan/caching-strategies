import Database from 'better-sqlite3';

export const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    price REAL    NOT NULL
  )
`);

// Seed once
const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
if (count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
  for (let i = 1; i <= 100; i++) insert.run(`Product ${i}`, i * 10);
}
