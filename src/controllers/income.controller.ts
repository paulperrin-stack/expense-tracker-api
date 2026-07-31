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
    const { tagIds, ...incomeData } = result.data;

    const income = await prisma.$transaction(async (tx) => {
        const newIncome = await tx.income.create({
            data: {
                ...incomeData,
                date: new Date(incomeData.date),
                userId,
            },
        });

        if (tagIds && tagIds.length > 0) {
            await tx.incomeTag.createMany({
                data: tagIds.map((tagId) => ({
                    incomeId: newIncome.id,
                    tagId,
                })),
            });
        }

        return newIncome;
    });
    res.status(201).json(income);
}

export async function getIncomes(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { month, year, tagId } = req.query;

    const where: any = { userId };

    if (month && year) {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 1);
        where.date = { gte: startDate, lt: endDate };
    }

    if (tagId) {
        where.incomeTags = { some: { tagId } };
    }

    const incomes = await prisma.income.findMany({ where });

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

    const { tagIds, ...incomeData } = result.data;

    const income = await prisma.income.updateMany({
        where: { id, userId },
        data: {
            ...incomeData,
            date: new Date(incomeData.date),
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