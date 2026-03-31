import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseExpenseInput } from "@/lib/ai";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getUserById } from "@/lib/workspace";
import { expenseInputSchema, expenseRecordSchema } from "@/lib/validators";

function toExpenseRecord(expense: {
  id: string;
  amount: number;
  category: string;
  description: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
  } | null;
}) {
  return {
    id: expense.id,
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    createdAt: expense.createdAt.toISOString(),
    userId: expense.user?.id ?? "legacy-user",
    userName: expense.user?.name ?? "Local Owner",
    userEmail: expense.user?.email ?? "local-owner@expense.local",
    userAvatarColor: expense.user?.avatarColor ?? "#165fa8"
  };
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Please login with your email." }, { status: 401 });
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId: user.id
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  return NextResponse.json({
    user,
    expenses: expenses.map(toExpenseRecord)
  });
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Please login with your email." }, { status: 401 });
    }

    const body = await request.json();
    const { text } = expenseInputSchema.parse(body);
    const parsedExpense = await parseExpenseInput(text);
    const validatedExpense = expenseRecordSchema.parse(parsedExpense);

    const expense = await prisma.expense.create({
      data: {
        amount: validatedExpense.amount,
        category: validatedExpense.category,
        description: validatedExpense.description,
        createdAt: new Date(validatedExpense.date),
        userId: user.id
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({ expense: toExpenseRecord(expense) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Please enter a valid expense."
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "We could not save that expense.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}