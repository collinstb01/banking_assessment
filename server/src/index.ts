/**
 * Banking Dashboard API Server
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Currently uses in-memory SQLite (not persistent)
 * - Basic error handling
 * - No authentication/authorization
 * - No input validation
 * - No rate limiting
 * - No caching
 * - No logging system
 * - No tests
 *
 * Candidates should consider:
 * - Data persistence
 * - Security measures
 * - API documentation
 * - Error handling
 * - Performance optimization
 * - Code organization
 * - Testing strategy
 */

import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { Database } from "sqlite3";
import { uuid } from "uuidv4";

const app = express();
const PORT = 3001;

// Basic middleware setup - Consider additional security middleware
app.use(cors());
app.use(express.json());

// Database setup - Currently using in-memory SQLite for simplicity
// Consider: Production database, connection pooling, error handling
const db: Database = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to in-memory SQLite database");
    initializeDatabase();
  }
});

function initializeDatabase() {
  const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY UNIQUE,
      name TEXT,
      email TEXT UNIQUE,
      createdAt TEXT
    )
  `;

  db.run(usersTableQuery, (err) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("Users table created");
      insertSampleUsersData();
    }
  });

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      accountNumber TEXT UNIQUE,
      accountType TEXT CHECK(accountType IN ('CHECKING', 'SAVINGS')),
      balance REAL,
      accountHolder TEXT,
      createdAt TEXT,

      userId TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.log("------- accounts table query -------");

      console.error("Error creating table:", err);
    } else {
      console.log("Accounts table created");
      insertSampleData();
    }
  });

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

  db.run(transactionsTableQuery, (err) => {
    if (err) {
      console.log("------- transactions table query -------");
      console.error("Error creating table:", err);
    } else {
      console.log("Transactions table created", transactionsTableQuery);
    }
  });
}

function insertSampleUsersData() {
  const sampleUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      // password: "password",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      // password: "password",
      createdAt: new Date().toISOString(),
    },
  ];

  const insertQuery = `
    INSERT OR REPLACE INTO users (id, name, email, createdAt)
    VALUES (?, ?, ?, ?)
  `;

  sampleUsers.forEach((account) => {
    db.run(
      insertQuery,
      [account.id, account.name, account.email, account.createdAt],
      (err) => {
        if (err) {
          console.error("Error inserting sample data:", err);
        }
      }
    );
  });
}

function insertSampleData() {
  const sampleAccounts = [
    {
      id: "1",
      accountNumber: "1001",
      accountType: "CHECKING",
      balance: 5000.0,
      accountHolder: "John Doe",
      createdAt: new Date().toISOString(),
      userId: "1",
    },
    {
      id: "2",
      accountNumber: "1002",
      accountType: "SAVINGS",
      balance: 10000.0,
      accountHolder: "Jane Smith",
      createdAt: new Date().toISOString(),
      userId: "2",
    },
  ];

  const insertQuery = `
    INSERT OR REPLACE INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  sampleAccounts.forEach((account) => {
    db.run(
      insertQuery,
      [
        account.id,
        account.accountNumber,
        account.accountType,
        account.balance,
        account.accountHolder,
        account.createdAt,
        account.userId,
      ],
      (err) => {
        if (err) {
          console.error("Error inserting sample data:", err);
        }
      }
    );
  });
}

app.get("/api/users", (req, res) => {
  db.all(
    "SELECT users.*, accounts.id as accountId, accounts.balance as balance, accounts.accountNumber as accountNumber FROM users LEFT JOIN accounts ON users.id = accounts.userId",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Basic API routes
// Consider: Input validation, authentication, rate limiting, response formatting
app.get("/api/accounts", (req, res) => {
  db.all("SELECT * FROM accounts", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get("/api/accounts/:id", (req, res) => {
  db.get("SELECT * FROM accounts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json(row);
  });
});

app.post("/api/transactions", async (req, res) => {
  const id = Math.random().toString(36).substring(2, 15);
  const { accountId, amount, description, type, accountNumber } = req.body;
  const createdAt = new Date().toISOString();

  // Input validation
  if (!accountId || !amount || !description || !type) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (amount <= 0) {
    res.status(400).json({ error: "Amount must be greater than zero" });
    return;
  }

  if (!["DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(type)) {
    res.status(400).json({ error: "Invalid transaction type" });
    return;
  }

  db.get(
    "SELECT * FROM accounts WHERE id = ?",
    [accountId],
    (err, sourceAccount: any) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!sourceAccount) {
        res.status(404).json({ error: "Source account not found" });
        return;
      }

      if (type === "DEPOSIT") {
        db.run(
          "UPDATE accounts SET balance = balance + ? WHERE id = ?",
          [amount, accountId],
          (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            db.run(
              "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
              [id, type, amount, description, createdAt, accountId],
              (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                res.json({ message: "Transaction created" });
              }
            );
          }
        );
      } else if (type === "WITHDRAWAL") {
        if (sourceAccount.balance < amount) {
          res.status(400).json({ error: "Insufficient balance" });
          return;
        }

        if (!accountNumber) {
          res
            .status(400)
            .json({ error: "Account number is required for withdrawal" });
          return;
        }

        db.run(
          "UPDATE accounts SET balance = balance - ? WHERE id = ?",
          [amount, accountId],
          (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            db.run(
              "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
              [id, type, amount, description, createdAt, accountId],
              (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                res.json({ message: "Transaction created" });
              }
            );
          }
        );
      } else if (type === "TRANSFER") {
        if (!accountNumber) {
          res
            .status(400)
            .json({ error: "Target account number is required for transfer" });
          return;
        }

        if (sourceAccount.balance < amount) {
          res.status(400).json({ error: "Insufficient balance" });
          return;
        }

        if (sourceAccount.accountNumber === accountNumber) {
          res
            .status(400)
            .json({ error: "Cannot transfer money to the same account" });
          return;
        }

        db.get(
          "SELECT * FROM accounts WHERE accountNumber = ?",
          [accountNumber],
          (err, targetAccount: any) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            if (!targetAccount) {
              res.status(404).json({ error: "Target account not found" });
              return;
            }

            db.run(
              "UPDATE accounts SET balance = balance - ? WHERE id = ?",
              [amount, accountId],
              (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }

                db.run(
                  "UPDATE accounts SET balance = balance + ? WHERE accountNumber = ?",
                  [amount, accountNumber],
                  (err) => {
                    if (err) {
                      res.status(500).json({
                        error:
                          "Failed to add funds to target account: " +
                          err.message,
                      });
                      return;
                    }

                    const sourceTransactionId = Math.random()
                      .toString(36)
                      .substring(2, 15);
                    db.run(
                      "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
                      [
                        sourceTransactionId,
                        type,
                        amount,
                        `Transfer to account ${accountNumber}: ${description}`,
                        createdAt,
                        accountId,
                      ],
                      (err) => {
                        if (err) {
                          res.status(500).json({
                            error:
                              "Failed to create transaction record for source account",
                          });
                          return;
                        }

                        const targetTransactionId = Math.random()
                          .toString(36)
                          .substring(2, 15);
                        db.run(
                          "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
                          [
                            targetTransactionId,
                            "DEPOSIT",
                            amount,
                            `Transfer from account ${sourceAccount.accountNumber}: ${description}`,
                            createdAt,
                            targetAccount.id,
                          ],
                          (err) => {
                            if (err) {
                              res.status(500).json({
                                error:
                                  "Failed to create transaction record for target account",
                              });
                              return;
                            }
                            res.json({ message: "Transaction created" });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    }
  );
});

app.get("/api/accounts/:id/transactions", (req, res) => {
  const accountId = req.params.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    res.status(400).json({ error: "Page must be greater than 0" });
    return;
  }

  if (limit < 1 || limit > 100) {
    res.status(400).json({ error: "Limit must be between 1 and 100" });
    return;
  }

  const offset = (page - 1) * limit;

  db.get(
    "SELECT COUNT(*) as total FROM transactions WHERE accountId = ?",
    [accountId],
    (err, countRow: any) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const totalTransactions = countRow.total;
      const totalPages = Math.ceil(totalTransactions / limit);

      db.all(
        "SELECT * FROM transactions WHERE accountId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?",
        [accountId, limit, offset],
        (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          res.json({
            data: rows,
            pagination: {
              currentPage: page,
              pageSize: limit,
              totalItems: totalTransactions,
              totalPages: totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            },
          });
        }
      );
    }
  );
});
// Server startup
// Consider: Graceful shutdown, environment configuration, clustering
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// id TEXT PRIMARY KEY UNIQUE,
//     type TEXT CHECK(type IN ('DEPOSIT', 'WITHDRAWAL')),
//     amount REAL,
//     description TEXT,
//     createdAt TEXT,

//     accountId TEXT,
