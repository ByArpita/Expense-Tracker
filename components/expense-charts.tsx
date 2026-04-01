"use client";

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
};

const pieColors = ["#0f7b56", "#59a96a", "#c8d86d", "#efc75e", "#d96c45", "#6f8f72"];

export function ExpenseCharts({
  weeklyTrend,
  categoryDistribution
}: ExpenseChartsProps) {
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
        <div className={styles.heading}>
          <h3>Category distribution</h3>
          <p>How your current month is split</p>
        </div>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={1}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.legend}>
          {categoryDistribution.map((entry, index) => (
            <div key={entry.name} className={styles.legendItem}>
              <span
                className={styles.swatch}
                style={{ backgroundColor: pieColors[index % pieColors.length] }}
              />
              <strong>{entry.name}</strong>
              <small>₹{entry.value.toFixed(0)}</small>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
