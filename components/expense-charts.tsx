"use client";

import { useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import styles from "./expense-charts.module.scss";
import type { CategoryDistributionItem, WeeklyTrendPoint } from "@/lib/types";

type ExpenseChartsProps = {
  weeklyTrend: WeeklyTrendPoint[];
  categoryDistribution: CategoryDistributionItem[];
  previousMonthCategoryDistribution: CategoryDistributionItem[];
};

const pieColors = ["#0f7b56", "#59a96a", "#c8d86d", "#efc75e", "#d96c45", "#6f8f72"];

type MonthView = "current" | "previous";

function DistributionLegend({ items }: { items: CategoryDistributionItem[] }) {
  if (items.length === 0) {
    return <p className={styles.emptyMessage}>No expenses available for this month yet.</p>;
  }

  return (
    <div className={styles.legend}>
      {items.map((entry, index) => (
        <div key={entry.name} className={styles.legendItem}>
          <span
            className={styles.swatch}
            style={{ backgroundColor: pieColors[index % pieColors.length] }}
          />
          <strong>{entry.name}</strong>
          <small>Rs. {entry.value.toFixed(0)}</small>
        </div>
      ))}
    </div>
  );
}

export function ExpenseCharts({
  weeklyTrend,
  categoryDistribution,
  previousMonthCategoryDistribution
}: ExpenseChartsProps) {
  const [monthView, setMonthView] = useState<MonthView>("current");

  const pieData = monthView === "current" ? categoryDistribution : previousMonthCategoryDistribution;
  const pieSubtitle =
    monthView === "current" ? "How your current month is split" : "How your previous month was split";

  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <div className={styles.heading}>
          <h3>Weekly spending trend</h3>
          <p>Daily totals for the last 7 days</p>
        </div>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyTrend}>
              <XAxis dataKey="label" stroke="#587061" tickLine={false} axisLine={false} />
              <YAxis stroke="#587061" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0f7b56"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0f7b56" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={styles.panel}>
        <div className={styles.headingRow}>
          <div className={styles.heading}>
            <h3>Category distribution</h3>
            <p>{pieSubtitle}</p>
          </div>
          <div className={styles.monthToggle}>
            <button
              type="button"
              className={monthView === "current" ? styles.monthToggleActive : undefined}
              onClick={() => setMonthView("current")}
            >
              This month
            </button>
            <button
              type="button"
              className={monthView === "previous" ? styles.monthToggleActive : undefined}
              onClick={() => setMonthView("previous")}
            >
              Previous month
            </button>
          </div>
        </div>
        <div className={styles.chartWrap}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={1}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>No category data for this month yet.</div>
          )}
        </div>
        <DistributionLegend items={pieData} />
      </article>
    </section>
  );
}
