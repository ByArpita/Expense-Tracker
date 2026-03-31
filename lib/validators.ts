import { z } from "zod";

export const expenseInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(2, "Please type a little more detail.")
    .max(200, "Keep the expense note under 200 characters.")
});

export const sessionInputSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  name: z.string().trim().min(2, "Name should be at least 2 characters.").max(40).optional()
});

export const expenseRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().min(2).max(120),
  date: z.string().datetime({ offset: true })
});