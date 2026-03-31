export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
};

export type ExpenseRecord = {
  id: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarColor: string;
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
  currentUser: UserProfile;
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

export type SessionResponse = {
  user: UserProfile | null;
};