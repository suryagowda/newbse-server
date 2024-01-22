const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('stocks.db');

db.serialize(() => {
  // Drop existing tables if they exist
  db.run('DROP TABLE IF EXISTS stocks');
  db.run('DROP TABLE IF EXISTS favorites');
  db.run('DROP TABLE IF EXISTS stock_data');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS stocks (
      code TEXT,
      name TEXT,
      open REAL,
      high REAL,
      low REAL,
      close REAL,
      date DATE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS stock_data (
      date TEXT,
      code TEXT,
      name TEXT,
      open REAL,
      high REAL,
      low REAL,
      close REAL
    )
  `);
});

module.exports = db;
