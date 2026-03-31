import styles from "./empty-state.module.scss";

export function EmptyState() {
  return (
    <section className={styles.panel}>
      <h3>Your dashboard is ready.</h3>
      <p>
        Add your first expense above and the app will immediately show today&apos;s list,
        weekly trend, monthly category split, and logic-based insights.
      </p>
    </section>
  );
}
