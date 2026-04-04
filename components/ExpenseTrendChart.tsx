"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import styles from "./ExpenseTrendChart.module.scss";
import type { ExpenseTrendRange, ExpenseTrendResponse } from "@/lib/types";

const filters: Array<{ value: ExpenseTrendRange; label: string }> = [
  { value: "7d", label: "Last 7 Days" },
  { value: "1m", label: "Last 1 Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last 1 Year" }
];

type ExpenseTrendChartProps = {
  refreshKey: number;
};

export function ExpenseTrendChart({ refreshKey }: ExpenseTrendChartProps) {
  const [range, setRange] = useState<ExpenseTrendRange>("7d");
  const [trend, setTrend] = useState<ExpenseTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTrend() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/expenses/trend?range=${range}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Unable to load expense trend.");
        }

        const payload = (await response.json()) as ExpenseTrendResponse;

        if (!cancelled) {
          setTrend(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load expense trend.");
          setTrend(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTrend();

    return () => {
      cancelled = true;
    };
  }, [range, refreshKey]);

  const points = trend?.points ?? [];
  const hasAnyData = points.some((point) => point.total > 0);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3>Expense trends</h3>
          <p>Total spending over time for the selected range</p>
        </div>
        <div className={styles.filters}>
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={range === filter.value ? styles.filterActive : undefined}
              onClick={() => setRange(filter.value)}
              disabled={loading && range === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrap}>
        {loading ? (
          <div className={styles.state}>Loading trend data...</div>
        ) : error ? (
          <div className={styles.state}>{error}</div>
        ) : !hasAnyData ? (
          <div className={styles.state}>No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 50, 39, 0.08)" />
              <XAxis dataKey="label" stroke="#587061" tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis stroke="#587061" tickLine={false} axisLine={false} width={56} />
              <Tooltip
                formatter={(value) => {
                  const amount = typeof value === "number" ? value : Number(value ?? 0);
                  return [`Rs. ${amount.toFixed(0)}`, "Total spent"];
                }}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#1e8f65"
                strokeWidth={3}
                dot={{ r: 3, fill: "#1e8f65" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
