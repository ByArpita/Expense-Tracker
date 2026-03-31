import styles from "./dashboard-cards.module.scss";

type DashboardCardsProps = {
  weeklyTotal: number;
  monthlyTotal: number;
  topCategory: string | null;
  todayCount: number;
};

export function DashboardCards({
  weeklyTotal,
  monthlyTotal,
  topCategory,
  todayCount
}: DashboardCardsProps) {
  const cards = [
    {
      label: "This week",
      value: `₹${weeklyTotal.toFixed(0)}`,
      hint: "Total spending in the last 7 days"
    },
    {
      label: "This month",
      value: `₹${monthlyTotal.toFixed(0)}`,
      hint: "Month-to-date total"
    },
    {
      label: "Top category",
      value: topCategory ?? "None yet",
      hint: "Largest category this month"
    },
    {
      label: "Today",
      value: `${todayCount}`,
      hint: "Expenses logged today"
    }
  ];

  return (
    <section className={styles.grid}>
      {cards.map((card) => (
        <article key={card.label} className={styles.card}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
