import jwt from "jsonwebtoken";
import { config } from "../config";
import type { Request, Response, NextFunction } from "express";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      userId: string;
      email: string;
    };
    // @ts-ignore
    req.userId = decoded.userId;
    // @ts-ignore
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};
