import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uuid } from "uuidv4";
import { dbGet, dbRun } from "../models/database";
import { config } from "../config";
import type { SignupRequest, LoginRequest, User, Account } from "../types";
import type { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, accountType }: SignupRequest = req.body;

  // Validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
    );

    // Create user
    const userId = uuid();
    const createdAt = new Date().toISOString();

    await dbRun(
      "INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, ?)",
      [userId, name, email, hashedPassword, createdAt]
    );

    // Create account for user
    const accountId = uuid();
    const accountNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const accountTypeValue = accountType || "CHECKING";

    await dbRun(
      "INSERT INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [accountId, accountNumber, accountTypeValue, 0, name, createdAt, userId]
    );

    // Generate JWT
    // @ts-ignore
    const token = jwt.sign({ userId, email }, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn,
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: userId,
        name,
        email,
        accountNumber,
        accountType: accountTypeValue,
        balance: 0,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Get user
    const user = await dbGet<User>("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Get user's account
    const account = await dbGet<Account>(
      "SELECT * FROM accounts WHERE userId = ?",
      [user.id]
    );

    // Generate JWT
    // @ts-ignore
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret as string,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountId: account?.id,
        accountNumber: account?.accountNumber,
        accountType: account?.accountType,
        balance: account?.balance || 0,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};
