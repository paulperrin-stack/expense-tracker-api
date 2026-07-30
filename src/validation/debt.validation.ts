import { z } from 'zod';

export const createDebtSchema = z.object({
    amount: z.number().positive(),
    balance: z.number().nonnegative(),
    interestRate: z.number().nonnegative().max(100),
    minPayment: z.number().positive(),
    description: z.string().min(1),
    date: z.string().datetime(),
})