import { Request, Response } from "express";
import prisma from "../prisma";
import { createDebtSchema } from "../validation/debt.validation";

// createDebt, getDebts, updateDebt, deleteDebt

export async function createDebt(req: Request, res: Response) {
    const result = createDebtSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        return;
    }

    const userId = req.user!.userId;

    const debt = await prisma.debt.create({
        data: {
            ...result.data,
            date: new Date(result.data.date),
            userId,
        },
    });

    res.status(201).json(debt);
}

export async function getDebts(req: Request, res: Response) {
    const userId = req.user!.userId;

    const debts = await prisma.debt.findMany({
        where: { userId },
    });

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

    const debt = await prisma.debt.updateMany({
        where: { id, userId },
        data: {
            ...result.data,
            date: new Date(result.data.date),
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