import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseExpenseInput } from "@/lib/ai";
import { expenseInputSchema, expenseRecordSchema } from "@/lib/validators";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  return NextResponse.json({ expenses });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = expenseInputSchema.parse(body);

    const parsedExpense = await parseExpenseInput(text);
    const validatedExpense = expenseRecordSchema.parse(parsedExpense);

    const expense = await prisma.expense.create({
      data: {
        amount: validatedExpense.amount,
        category: validatedExpense.category,
        description: validatedExpense.description,
        createdAt: new Date(validatedExpense.date)
      }
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Please enter a valid expense."
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "We could not save that expense.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
