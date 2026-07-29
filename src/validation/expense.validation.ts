import { z } from "zod";

export const createExpenseSchema = z.object({
    amount: z.number().positive(),
    description: z.string().min(1),
    date: z.string().datetime(),
});