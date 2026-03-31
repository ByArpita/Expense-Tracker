"use client";

import { useEffect, useState } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { DashboardCards } from "@/components/dashboard-cards";
import { ExpenseCharts } from "@/components/expense-charts";
import { ExpenseList } from "@/components/expense-list";
import { InsightsPanel } from "@/components/insights-panel";
import { EmptyState } from "@/components/empty-state";
import styles from "./expense-app-shell.module.scss";
import type { DashboardResponse, ExpenseRecord } from "@/lib/types";

type ExpenseAppShellProps = {
  showHeader: boolean;
};

const emptySummary: DashboardResponse = {
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
  const [data, setData] = useState<DashboardResponse>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAdded, setLastAdded] = useState<ExpenseRecord | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);

      try {
        const response = await fetch("/api/expenses/summary", {
          cache: "no-store"
        });

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

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section className={styles.shell}>
      {showHeader ? (
        <div className={styles.sectionIntro}>
          <h2>Add and review expenses</h2>
          <p>Everything updates right after you save a new entry.</p>
        </div>
      ) : null}

      <ExpenseForm
        onExpenseAdded={(expense) => {
          setLastAdded(expense);
          setRefreshKey((value) => value + 1);
        }}
      />

      {lastAdded ? (
        <div className={styles.toast}>
          Saved ₹{lastAdded.amount.toFixed(0)} for {lastAdded.category.toLowerCase()}.
        </div>
      ) : null}

      {loading ? (
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
            <ExpenseList expenses={data.todayExpenses} />
            <InsightsPanel insights={data.insights} />
          </div>
          <ExpenseCharts
            weeklyTrend={data.weeklyTrend}
            categoryDistribution={data.categoryDistribution}
          />
        </>
      )}
    </section>
  );
}
