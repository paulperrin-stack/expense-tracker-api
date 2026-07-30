import { Request, Response } from "express";
import prisma from "../prisma";
import { createCategorySchema } from "../validation/category.validation";

export async function createCategory(req: Request, res: Response) {
    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const userId = req.user!.userId;

    const category = await prisma.category.create({
        data: {
            ...result.data,
            userId,
        },
    });

    res.status(201).json(category);
}

export async function getCategories(req: Request, res: Response) {
    const userId = req.user!.userId;

    const categories = await prisma.category.findMany({
        where: { userId },
    });

    res.status(200).json(categories);
}

export async function updateCategory(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const category = await prisma.category.updateMany({
        where: { id, userId },
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