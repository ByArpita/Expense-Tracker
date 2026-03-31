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
      value: `Rs. ${weeklyTotal.toFixed(0)}`,
      hint: "Your total spending in the last 7 days"
    },
    {
      label: "This month",
      value: `Rs. ${monthlyTotal.toFixed(0)}`,
      hint: "Your month-to-date total"
    },
    {
      label: "Top category",
      value: topCategory ?? "None yet",
      hint: "Your largest category this month"
    },
    {
      label: "Today",
      value: `${todayCount}`,
      hint: "Expenses you logged today"
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