import { Request, Response } from "express";
import prisma from "../prisma";
import { createDebtSchema } from "../validation/debt.validation";
import { calculatePayoff } from "../utils/debtPayoff";

// createDebt, getDebts, updateDebt, deleteDebt

export async function createDebt(req: Request, res: Response) {
    const result = createDebtSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const userId = req.user!.userId;
    const { tagIds, ...debtData } = result.data;

    const debt = await prisma.$transaction(async (tx) => {
        const newDebt = await tx.debt.create({
            data: {
                ...debtData,
                date: new Date(debtData.date),
                userId,
            },
        });

        if (tagIds && tagIds.length > 0) {
            await tx.debtTag.createMany({
                data: tagIds.map((tagId) => ({
                    debtId: newDebt.id,
                    tagId,
                })),
            });
        }

        return newDebt;
    });
    res.status(201).json(debt);
}

export async function getDebts(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { month, year, tagId } = req.query;

    const where: any = { userId };

    if (month && year) {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 1);
        where.date = { gte: startDate, lt: endDate };
    }

    if (tagId) {
        where.debtTags = { some: { tagId } };
    }

    const debts = await prisma.debt.findMany({ where });

    res.status(200).json(debts);
}

export async function updateDebt(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = createDebtSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const { tagIds, ...debtData } = result.data;

    const debt = await prisma.debt.updateMany({
        where: { id, userId },
        data: {
            ...debtData,
            date: new Date(debtData.date),
        },
    });

    if (debt.count === 0) {
        res.status(404).json({ message: "Debt not found" });
        return;
    }

    res.status(200).json({ message: "Debt updated successfully" });
}

export async function deleteDebt(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const debt = await prisma.debt.deleteMany({
        where: { id, userId },
    });

    if (debt.count === 0) {
        res.status(404).json({ message: "Debt not found" });
        return;
    }

    res.status(200).json({ message: "Debt deleted successfully" });
}

export async function getPayoffPlan(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { extra, strategy } = req.query;

    if (strategy !== "avalanche" && strategy !== "snowball") {
        res.status(400).json({ message: "strategy must be 'avalanche' or 'snowball'" });
        return;
    }

    const debts = await prisma.debt.findMany({ where: { userId } });

    const debtInputs = debts.map((d) => ({
        id: d.id,
        balance: Number(d.balance),
        interestRate: Number(d.interestRate),
        minPayment: Number(d.minPayment),
    }));

    const result = calculatePayoff(debtInputs, Number(extra), strategy);

    res.status(200).json(result);
}