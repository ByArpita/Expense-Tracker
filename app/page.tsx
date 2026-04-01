import { ExpenseAppShell } from "@/components/expense-app-shell";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Personal AI Expense Tracker</span>
          <h1>Track your expenses with ease.</h1>
          <p>
            Create your account, add expenses in natural language, and come back later from any
            device to your own personal history and insights.
          </p>
        </div>
      </section>

      <ExpenseAppShell showHeader={false} />
    </main>
  );
}
