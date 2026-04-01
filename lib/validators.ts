import { z } from "zod";

export const expenseInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(2, "Please type a little more detail.")
    .max(200, "Keep the expense note under 200 characters.")
});

const emailField = z.string().trim().email("Enter a valid email address.");
const passwordField = z
  .string()
  .min(8, "Password should be at least 8 characters.")
  .max(72, "Password should be 72 characters or fewer.");

export const sessionInputSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("signin"),
    email: emailField,
    password: passwordField
  }),
  z.object({
    mode: z.literal("signup"),
    email: emailField,
    password: passwordField,
    name: z.string().trim().min(2, "Name should be at least 2 characters.").max(40)
  })
]);

export const expenseRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().min(2).max(120),
  date: z.string().datetime({ offset: true })
});
