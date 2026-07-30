import { Request, Response } from "express";
import prisma from "../prisma";
import { createIncomeSchema } from "../validation/income.validation";

export async function createIncome(req: Request, res: Response) {
    const result = createIncomeSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const userId = req.user!.userId;

    const income = await prisma.income.create({
        data: {
            ...result.data,
            date: new Date(result.data.date),
            userId,
        },
    });
    
    res.status(201).json(income);
}

export async function getIncomes(req: Request, res: Response) {
    const userId = req.user!.userId;

    const incomes = await prisma.income.findMany({
        where: { userId },
    });

    res.status(200).json(incomes);
}

export async function updateIncome(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = createIncomeSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const income = await prisma.income.updateMany({
        where: { id, userId },
        data: {
            ...result.data,
            date: new Date(result.data.date),
        },
    });

    if (income.count === 0) {
        res.status(404).json({ message: "Income not found" });
        return;
    }

    res.status(200).json({ message: "Income updated successfully" });
}

export async function deleteIncome(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const income = await prisma.income.deleteMany({
        where: { id, userId },
    });

    if (income.count === 0) {
        res.status(404).json({ message: "Income not found" });
        return;
    }

    res.status(200).json({ message: "Income deleted successfully" });
}