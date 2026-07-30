import { Router } from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/category.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createCategory);
router.get("/", authenticateToken, getCategories);
router.put("/:id", authenticateToken, updateCategory);
router.delete("/:id", authenticateToken, deleteCategory);

export default router;