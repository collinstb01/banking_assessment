import { uuid } from "uuidv4";
import { dbGet, dbRun, dbAll } from "../models/database";
import type { Account, TransactionRequest } from "../types";
import type { Request, Response } from "express";

export const getUserAccount = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    const account = await dbGet(
      "SELECT accounts.*, users.name, users.email FROM accounts JOIN users ON accounts.userId = users.id WHERE users.id = ?",
      [userId]
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ error: "Failed to fetch account" });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  const { amount, description, type, accountNumber }: TransactionRequest =
    req.body;
  // @ts-ignore
  const userId = req.userId;

  // Validation
  if (!amount || typeof amount !== "number") {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero" });
  }

  const validAmount = Math.round(amount * 100) / 100;

  if (!description || description.trim().length === 0) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (!type || !["DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(type)) {
    return res.status(400).json({
      error:
        "Invalid transaction type. Must be DEPOSIT, WITHDRAWAL, or TRANSFER",
    });
  }

  if ((type === "WITHDRAWAL" || type === "TRANSFER") && !accountNumber) {
    return res.status(400).json({
      error: `Account number is required for ${type.toLowerCase()} transactions`,
    });
  }

  try {
    const createdAt = new Date().toISOString();
    const transactionId = uuid();

    // Get user's account
    const sourceAccount = await dbGet<Account>(
      "SELECT * FROM accounts WHERE userId = ?",
      [userId]
    );

    if (!sourceAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (type === "DEPOSIT") {
      await dbRun("UPDATE accounts SET balance = balance + ? WHERE id = ?", [
        validAmount,
        sourceAccount.id,
      ]);

      await dbRun(
        "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
        [
          transactionId,
          type,
          validAmount,
          description.trim(),
          createdAt,
          sourceAccount.id,
        ]
      );

      return res.status(201).json({
        message: "Deposit successful",
        transactionId,
        newBalance: sourceAccount.balance + validAmount,
      });
    }

    if (type === "WITHDRAWAL") {
      if (sourceAccount.balance < validAmount) {
        return res.status(400).json({
          error: "Insufficient funds",
          currentBalance: sourceAccount.balance,
          requestedAmount: validAmount,
        });
      }

      await dbRun("UPDATE accounts SET balance = balance - ? WHERE id = ?", [
        validAmount,
        sourceAccount.id,
      ]);

      await dbRun(
        "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
        [
          transactionId,
          type,
          validAmount,
          `Withdrawal: ${description.trim()}`,
          createdAt,
          sourceAccount.id,
        ]
      );

      return res.status(201).json({
        message: "Withdrawal successful",
        transactionId,
        newBalance: sourceAccount.balance - validAmount,
      });
    }

    if (type === "TRANSFER") {
      if (sourceAccount.balance < validAmount) {
        return res.status(400).json({
          error: "Insufficient funds for transfer",
          currentBalance: sourceAccount.balance,
          requestedAmount: validAmount,
        });
      }

      if (sourceAccount.accountNumber === accountNumber) {
        return res
          .status(400)
          .json({ error: "Cannot transfer to the same account" });
      }

      const targetAccount = await dbGet<Account>(
        "SELECT * FROM accounts WHERE accountNumber = ?",
        [accountNumber]
      );

      if (!targetAccount) {
        return res.status(404).json({ error: "Target account not found" });
      }

      // Debit from source
      await dbRun("UPDATE accounts SET balance = balance - ? WHERE id = ?", [
        validAmount,
        sourceAccount.id,
      ]);

      // Credit to target
      await dbRun("UPDATE accounts SET balance = balance + ? WHERE id = ?", [
        validAmount,
        targetAccount.id,
      ]);

      // Record debit transaction for source account
      const sourceTransactionId = uuid();
      await dbRun(
        "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
        [
          sourceTransactionId,
          type,
          validAmount,
          `Transfer to ${
            targetAccount.accountHolder
          } (${accountNumber}): ${description.trim()}`,
          createdAt,
          sourceAccount.id,
        ]
      );

      // Record credit transaction for target account
      const targetTransactionId = uuid();
      await dbRun(
        "INSERT INTO transactions (id, type, amount, description, createdAt, accountId) VALUES (?, ?, ?, ?, ?, ?)",
        [
          targetTransactionId,
          "DEPOSIT",
          validAmount,
          `Transfer from ${sourceAccount.accountHolder} (${
            sourceAccount.accountNumber
          }): ${description.trim()}`,
          createdAt,
          targetAccount.id,
        ]
      );

      return res.status(201).json({
        message: "Transfer successful",
        transactionId: sourceTransactionId,
        sourceNewBalance: sourceAccount.balance - validAmount,
        targetAccount: targetAccount.accountHolder,
      });
    }
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(500).json({
      error: "Transaction failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    return res.status(400).json({ error: "Page must be greater than 0" });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: "Limit must be between 1 and 100" });
  }

  const offset = (page - 1) * limit;

  try {
    // Get user's account first
    const account = await dbGet("SELECT id FROM accounts WHERE userId = ?", [
      userId,
    ]);

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    interface CountRow {
      total: number;
    }

    const countRow = await dbGet<CountRow>(
      "SELECT COUNT(*) as total FROM transactions WHERE accountId = ?",
      [account.id]
    );

    const totalTransactions = countRow?.total || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    const rows = await dbAll(
      "SELECT * FROM transactions WHERE accountId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?",
      [account.id, limit, offset]
    );

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
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      error: "Failed to fetch transactions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
