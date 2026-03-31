import styles from "./insights-panel.module.scss";

type InsightsPanelProps = {
  insights: string[];
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <h3>Insights</h3>
        <p>Simple logic-based nudges for the MVP</p>
      </div>
      <div className={styles.list}>
        {insights.map((insight) => (
          <article key={insight} className={styles.item}>
            {insight}
          </article>
        ))}
      </div>
    </section>
  );
}
