import { z } from 'zod';

export const createTagSchema = z.object({
    categoryId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
})