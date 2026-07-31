import { Request, Response } from "express";
import prisma from "../prisma";
import { createExpenseSchema } from "../validation/expense.validation";

export async function createExpense(req: Request, res: Response) {
    const result = createExpenseSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const userId = req.user!.userId;
    const { tagIds, ...expenseData } = result.data;

    const expense = await prisma.$transaction(async (tx) => {
        const newExpense = await tx.expense.create({
            data: {
                ...expenseData,
                date: new Date(expenseData.date),
                userId,
            },
        });
        
        if (tagIds && tagIds.length > 0) {
            await tx.expenseTag.createMany({
                data: tagIds.map((tagId) => ({
                    expenseId: newExpense.id,
                    tagId,
                })),
            });
        }

        return newExpense;
    });
    res.status(201).json(expense);
}

export async function getExpenses(req: Request, res: Response) {
    const userId = req.user!.userId;

    const expenses = await prisma.expense.findMany({
        where: { userId },
    });

    res.status(200).json(expenses);
}

export async function updateExpense(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = createExpenseSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const { tagIds, ...expenseData } = result.data;

    const expense = await prisma.expense.updateMany({
        where: { id, userId },
        data: {
            ...expenseData,
            date: new Date(expenseData.date),
        },
    });

    if (expense.count === 0) {
        res.status(404).json({ message: "Expense not found" });
        return;
    }

    res.status(200).json({ message: "Expense updated successfully" });
}

export async function deleteExpense(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const expense = await prisma.expense.deleteMany({
        where: { id, userId },
    });

    if (expense.count === 0) {
        res.status(404).json({ message: "Expense not found" });
        return;
    }

    res.status(200).json({ message: "Expense deleted successfully" });
}