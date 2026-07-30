import { Router } from "express";
import { createDebt, getDebts, updateDebt, deleteDebt } from "../controllers/debt.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createDebt);
router.get("/", authenticateToken, getDebts);
router.put("/:id", authenticateToken, updateDebt);
router.delete("/:id", authenticateToken, deleteDebt);

export default router;