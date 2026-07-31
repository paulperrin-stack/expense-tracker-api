import { Router } from "express";
import { createDebt, getDebts, updateDebt, deleteDebt, getPayoffPlan } from "../controllers/debt.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createDebt);
router.get("/", authenticateToken, getDebts);
router.put("/:id", authenticateToken, updateDebt);
router.delete("/:id", authenticateToken, deleteDebt);
router.get("/payoff-plan", authenticateToken, getPayoffPlan)

export default router;