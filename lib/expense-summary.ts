import {
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  subDays
} from "date-fns";
import { prisma } from "@/lib/prisma";
import type {
  CategoryDistributionItem,
  DashboardResponse,
  ExpenseRecord,
  SummaryCategory,
  WeeklyTrendPoint
} from "@/lib/types";

function toExpenseRecord(expense: {
  id: string;
  amount: number;
  category: string;
  description: string;
  createdAt: Date;
}): ExpenseRecord {
  return {
    ...expense,
    createdAt: expense.createdAt.toISOString()
  };
}

function sumExpenses(expenses: Array<{ amount: number }>) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function groupByCategory(expenses: Array<{ category: string; amount: number }>): SummaryCategory[] {
  const map = new Map<string, number>();

  for (const expense of expenses) {
    map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount);
  }

  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total);
}

function buildWeeklyTrend(expenses: Array<{ amount: number; createdAt: Date }>): WeeklyTrendPoint[] {
  const end = startOfDay(new Date());
  const start = subDays(end, 6);

  return eachDayOfInterval({ start, end }).map((day) => ({
    label: format(day, "EEE"),
    amount: expenses
      .filter((expense) => isSameDay(expense.createdAt, day))
      .reduce((total, expense) => total + expense.amount, 0)
  }));
}

function buildInsights(
  weeklyTotal: number,
  previousWeeklyTotal: number,
  monthlyTopCategory: string | null,
  weeklyCategories: SummaryCategory[]
) {
  const insights: string[] = [];

  if (previousWeeklyTotal > 0) {
    const change = ((weeklyTotal - previousWeeklyTotal) / previousWeeklyTotal) * 100;
    const direction = change >= 0 ? "more" : "less";
    insights.push(`You spent ${Math.abs(change).toFixed(0)}% ${direction} this week than last week.`);
  } else {
    insights.push("This is your first active week of spending data, so every new entry sharpens the insights.");
  }

  if (monthlyTopCategory) {
    insights.push(`Top category this month is ${monthlyTopCategory}.`);
  }

  const leadingWeeklyCategory = weeklyCategories[0];
  if (leadingWeeklyCategory) {
    insights.push(
      `${leadingWeeklyCategory.category} leads this week at ₹${leadingWeeklyCategory.total.toFixed(0)}.`
    );
  }

  return insights;
}

export async function getExpenseDashboardData(): Promise<DashboardResponse> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const sevenDaysAgo = subDays(todayStart, 6);
  const previousWeekStart = subDays(todayStart, 13);
  const previousWeekEnd = subDays(todayEnd, 7);
  const monthStart = startOfMonth(now);

  const [todayExpenses, weeklyExpenses, previousWeeklyExpenses, monthlyExpenses, recentExpenses] =
    await Promise.all([
      prisma.expense.findMany({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.expense.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
            lte: todayEnd
          }
        }
      }),
      prisma.expense.findMany({
        where: {
          createdAt: {
            gte: previousWeekStart,
            lte: previousWeekEnd
          }
        }
      }),
      prisma.expense.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: todayEnd
          }
        }
      }),
      prisma.expense.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      })
    ]);

  const weeklySummaryCategories = groupByCategory(weeklyExpenses);
  const monthlyCategories = groupByCategory(monthlyExpenses);

  const categoryDistribution: CategoryDistributionItem[] = monthlyCategories.map((item) => ({
    name: item.category,
    value: item.total
  }));

  return {
    todayExpenses: todayExpenses.map(toExpenseRecord),
    weeklyTrend: buildWeeklyTrend(weeklyExpenses),
    categoryDistribution,
    weeklySummary: {
      total: sumExpenses(weeklyExpenses),
      previousTotal: sumExpenses(previousWeeklyExpenses),
      byCategory: weeklySummaryCategories
    },
    monthlySummary: {
      total: sumExpenses(monthlyExpenses),
      topCategory: monthlyCategories[0]?.category ?? null
    },
    insights: buildInsights(
      sumExpenses(weeklyExpenses),
      sumExpenses(previousWeeklyExpenses),
      monthlyCategories[0]?.category ?? null,
      weeklySummaryCategories
    ),
    recentExpenses: recentExpenses.map(toExpenseRecord)
  };
}
