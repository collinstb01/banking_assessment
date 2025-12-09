import { Router } from "express";
import {
  getUserAccount,
  createTransaction,
  getTransactions,
} from "../controllers/accountController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// @ts-ignore
router.get("/account", getUserAccount);
// @ts-ignore
router.post("/transactions", createTransaction);
// @ts-ignore
router.get("/transactions", getTransactions);

export default router;
