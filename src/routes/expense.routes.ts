import { Router } from "express";
import { createExpense } from "../controllers/expense.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createExpense);

export default router;