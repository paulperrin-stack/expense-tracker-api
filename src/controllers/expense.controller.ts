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

    const expense = await prisma.expense.create({
        data: {
            ...result.data,
            date: new Date(result.data.date),
            userId,
        },
    });
    
    res.status(201).json(expense);
}

