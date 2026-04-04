import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths
} from "date-fns";
import { prisma } from "@/lib/prisma";
import type { ExpenseTrendPoint, ExpenseTrendRange, ExpenseTrendResponse, UserProfile } from "@/lib/types";

type TrendConfig = {
  start: Date;
  end: Date;
  granularity: ExpenseTrendResponse["granularity"];
};

function getTrendConfig(range: ExpenseTrendRange): TrendConfig {
  const now = new Date();
  const end = endOfDay(now);

  switch (range) {
    case "7d":
      return {
        start: startOfDay(subDays(now, 6)),
        end,
        granularity: "day"
      };
    case "1m":
      return {
        start: startOfDay(subDays(now, 29)),
        end,
        granularity: "day"
      };
    case "3m":
      return {
        start: startOfMonth(subMonths(now, 2)),
        end,
        granularity: "month"
      };
    case "6m":
      return {
        start: startOfMonth(subMonths(now, 5)),
        end,
        granularity: "month"
      };
    case "1y":
      return {
        start: startOfMonth(subMonths(now, 11)),
        end,
        granularity: "month"
      };
  }
}

function buildDailyPoints(start: Date, end: Date, totalsByDay: Map<string, number>): ExpenseTrendPoint[] {
  return eachDayOfInterval({ start, end }).map((day) => {
    const key = format(day, "yyyy-MM-dd");

    return {
      date: key,
      label: format(day, "MMM d"),
      total: totalsByDay.get(key) ?? 0
    };
  });
}

function buildMonthlyPoints(start: Date, end: Date, totalsByMonth: Map<string, number>): ExpenseTrendPoint[] {
  return eachMonthOfInterval({ start, end }).map((month) => {
    const key = format(month, "yyyy-MM");

    return {
      date: key,
      label: format(month, "MMM yyyy"),
      total: totalsByMonth.get(key) ?? 0
    };
  });
}

export async function getExpenseTrendData(
  currentUser: UserProfile,
  range: ExpenseTrendRange
): Promise<ExpenseTrendResponse> {
  const { start, end, granularity } = getTrendConfig(range);

  const expenses = await prisma.expense.findMany({
    where: {
      userId: currentUser.id,
      OR: [
        {
          expenseDate: {
            gte: start,
            lte: end
          }
        },
        {
          expenseDate: null,
          createdAt: {
            gte: start,
            lte: end
          }
        }
      ]
    },
    select: {
      amount: true,
      expenseDate: true,
      createdAt: true
    }
  });

  const totals = new Map<string, number>();

  for (const expense of expenses) {
    const sourceDate = expense.expenseDate ?? expense.createdAt;
    const key = granularity === "day" ? format(sourceDate, "yyyy-MM-dd") : format(sourceDate, "yyyy-MM");
    totals.set(key, (totals.get(key) ?? 0) + expense.amount);
  }

  return {
    range,
    granularity,
    points: granularity === "day" ? buildDailyPoints(start, end, totals) : buildMonthlyPoints(start, end, totals)
  };
}
