"use client";

import { useEffect, useState } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { ExpenseForm } from "@/components/expense-form";
import { DashboardCards } from "@/components/dashboard-cards";
import { ExpenseCharts } from "@/components/expense-charts";
import { ExpenseList } from "@/components/expense-list";
import { InsightsPanel } from "@/components/insights-panel";
import { EmptyState } from "@/components/empty-state";
import styles from "./expense-app-shell.module.scss";
import type { DashboardResponse, ExpenseRecord, SessionResponse, UserProfile } from "@/lib/types";

type ExpenseAppShellProps = {
  showHeader: boolean;
};

const emptySummary: DashboardResponse = {
  currentUser: {
    id: "",
    name: "",
    email: "",
    avatarColor: "#165fa8"
  },
  todayExpenses: [],
  weeklyTrend: [],
  categoryDistribution: [],
  weeklySummary: {
    total: 0,
    previousTotal: 0,
    byCategory: []
  },
  monthlySummary: {
    total: 0,
    topCategory: null
  },
  insights: [],
  recentExpenses: []
};

export function ExpenseAppShell({ showHeader }: ExpenseAppShellProps) {
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<DashboardResponse>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAdded, setLastAdded] = useState<ExpenseRecord | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const payload = (await response.json()) as SessionResponse;

        if (!cancelled) {
          setSessionUser(payload.user);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setSessionUser(null);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      if (!sessionUser) {
        setLoading(false);
        setData(emptySummary);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/expenses/summary", {
          cache: "no-store"
        });

        if (response.status === 401) {
          if (!cancelled) {
            setSessionUser(null);
            setData(emptySummary);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const nextData = (await response.json()) as DashboardResponse;

        if (!cancelled) {
          setData(nextData);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setData(emptySummary);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadSummary();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionUser, refreshKey]);

  async function handleSignOut() {
    await fetch("/api/session", { method: "DELETE" });
    setSessionUser(null);
    setData(emptySummary);
    setLastAdded(null);
  }

  async function handleDeleteExpense(expenseId: string) {
    setDeletingExpenseId(expenseId);

    try {
      const response = await fetch(`/api/expenses?id=${encodeURIComponent(expenseId)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to remove expense.");
      }

      setLastAdded(null);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingExpenseId(null);
    }
  }

  return (
    <section className={styles.shell}>
      {showHeader ? (
        <div className={styles.sectionIntro}>
          <h2>Add and review expenses</h2>
          <p>Your dashboard is tied to your account, so only your personal expense history shows up here.</p>
        </div>
      ) : null}

      {sessionUser ? (
        <div className={styles.accountBar}>
          <div>
            <span className={styles.accountEyebrow}>Logged in</span>
            <h3>{sessionUser.name}</h3>
            {/* <p>{sessionUser.email}</p> */}
          </div>
          <button type="button" className={styles.signOutButton} onClick={() => void handleSignOut()}>
            Logout
          </button>
        </div>
      ) : (
        <AuthPanel
          onSignedIn={(response) => {
            setSessionUser(response.user);
            setRefreshKey((value) => value + 1);
          }}
        />
      )}

      {sessionUser ? (
        <ExpenseForm
          activeUser={sessionUser}
          onExpenseAdded={(expense) => {
            setLastAdded(expense);
            setRefreshKey((value) => value + 1);
          }}
        />
      ) : null}

      {lastAdded ? (
        <div className={styles.toast}>
          Saved Rs. {lastAdded.amount.toFixed(0)} in {lastAdded.category.toLowerCase()}.
        </div>
      ) : null}

      {sessionUser ? (
        loading ? (
          <div className={styles.loading}>Loading your dashboard...</div>
        ) : data.recentExpenses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DashboardCards
              weeklyTotal={data.weeklySummary.total}
              monthlyTotal={data.monthlySummary.total}
              topCategory={data.monthlySummary.topCategory}
              todayCount={data.todayExpenses.length}
            />
            <div className={styles.grid}>
              <ExpenseList
                expenses={data.todayExpenses}
                title="Today's expenses"
                subtitle={`${data.currentUser.name}'s entries for today`}
                onDeleteExpense={handleDeleteExpense}
                deletingExpenseId={deletingExpenseId}
              />
              <InsightsPanel insights={data.insights} />
            </div>
            <ExpenseCharts
              weeklyTrend={data.weeklyTrend}
              categoryDistribution={data.categoryDistribution}
            />
          </>
        )
      ) : null}
    </section>
  );
}
