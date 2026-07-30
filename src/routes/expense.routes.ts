import { Router } from "express";
import { createExpense, getExpenses, updateExpense, deleteExpense } from "../controllers/expense.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createExpense);
router.get("/", authenticateToken, getExpenses);
router.put("/:id", authenticateToken, updateExpense);
router.delete("/:id", authenticateToken, deleteExpense);

export default router;