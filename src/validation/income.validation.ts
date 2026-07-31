import { z } from "zod";

export const createIncomeSchema = z.object({
    amount: z.number().positive(),
    description: z.string().min(1),
    date: z.string().datetime(),
    tagIds: z.array(z.string()).optional(),
});