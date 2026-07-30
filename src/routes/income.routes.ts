import { Router } from "express";
import { createIncome, getIncomes, updateIncome, deleteIncome } from "../controllers/income.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createIncome);
router.get("/", authenticateToken, getIncomes);
router.put("/:id", authenticateToken, updateIncome);
router.delete("/:id", authenticateToken, deleteIncome);

export default router;