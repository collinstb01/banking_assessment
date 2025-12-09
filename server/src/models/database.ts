import sqlite3 from "sqlite3";
import type { Database } from "sqlite3";
import { config } from "../config";

let db: Database;

export const initDatabase = (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(config.database.filename, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        reject(err);
      } else {
        console.log("Connected to SQLite database");
        createTables()
          .then(() => resolve(db))
          .catch(reject);
      }
    });
  });
};

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};

export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("Database connection closed.");
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

// Helper functions for database operations
export const dbRun = (query: string, params: unknown[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const dbGet = <T = Record<string, unknown>>(
  query: string,
  params: unknown[] = []
): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row: T) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = <T = Record<string, unknown>>(
  query: string,
  params: unknown[] = []
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Create database tables
const createTables = async (): Promise<void> => {
  const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `;

  const accountsTableQuery = `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      accountNumber TEXT UNIQUE,
      accountType TEXT CHECK(accountType IN ('CHECKING', 'SAVINGS')),
      balance REAL DEFAULT 0,
      accountHolder TEXT,
      createdAt TEXT,
      userId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `;

  const transactionsTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY UNIQUE,
      type TEXT CHECK(type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
      amount REAL,
      description TEXT,
      createdAt TEXT,
      accountId TEXT,
      FOREIGN KEY (accountId) REFERENCES accounts (id)
    )
  `;

  try {
    await dbRun(usersTableQuery);
    console.log("Users table created");

    await dbRun(accountsTableQuery);
    console.log("Accounts table created");

    await dbRun(transactionsTableQuery);
    console.log("Transactions table created");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};
