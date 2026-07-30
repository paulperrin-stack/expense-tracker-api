import { Router } from "express";
import { createTag, getTags, updateTag, deleteTag } from "../controllers/tag.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticateToken, createTag);
router.get("/", authenticateToken, getTags);
router.put("/:id", authenticateToken, updateTag);
router.delete("/:id", authenticateToken, deleteTag);

export default router;