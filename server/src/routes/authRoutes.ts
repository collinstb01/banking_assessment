import { Router } from "express";
import { signup, login } from "../controllers/authController";

const router = Router();

// @ts-ignore
router.post("/signup", signup);
// @ts-ignore
router.post("/login", login);

export default router;
