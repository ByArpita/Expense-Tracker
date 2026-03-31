export type ExpenseRecord = {
  id: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
};

export type WeeklyTrendPoint = {
  label: string;
  amount: number;
};

export type CategoryDistributionItem = {
  name: string;
  value: number;
};

export type SummaryCategory = {
  category: string;
  total: number;
};

export type DashboardResponse = {
  todayExpenses: ExpenseRecord[];
  weeklyTrend: WeeklyTrendPoint[];
  categoryDistribution: CategoryDistributionItem[];
  weeklySummary: {
    total: number;
    previousTotal: number;
    byCategory: SummaryCategory[];
  };
  monthlySummary: {
    total: number;
    topCategory: string | null;
  };
  insights: string[];
  recentExpenses: ExpenseRecord[];
};
