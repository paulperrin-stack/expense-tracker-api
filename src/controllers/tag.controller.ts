import { Request, Response } from "express";
import prisma from "../prisma";
import { createTagSchema } from "../validation/tag.validation";

export async function createTag(req: Request, res: Response) {
    const result = createTagSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const userId = req.user!.userId;

    const category = await prisma.category.findFirst({
        where: { id: result.data.categoryId, userId },
    });

    if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
    }

    const tag = await prisma.tag.create({
        data: result.data,
    });

    res.status(201).json(tag);
}

export async function getTags(req: Request, res: Response) {
    const userId = req.user!.userId;

    const tags = await prisma.tag.findMany({
        where: { category: { userId } },
    });

    res.status(200).json(tags);
}

export async function updateTag(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = createTagSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const tag = await prisma.tag.updateMany({
        where: { id, category: { userId } },
        data: {
            ...result.data,
        },
    });

    if (category.count === 0) {
        res.status(404).json({ message: "Category not found" });
        return;
    }

    res.status(200).json({ message: "Category updated successfully" });
}

export async function deleteCategory(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const category = await prisma.category.deleteMany({
        where: { id, userId },
    });

    if (category.count === 0) {
        res.status(404).json({ message: "Category not found" });
        return;
    }

    res.status(200).json({ message: "Category deleted successfully" });
}