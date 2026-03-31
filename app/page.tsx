import Link from "next/link";
import { ExpenseAppShell } from "@/components/expense-app-shell";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Ultra-Simple AI Expense Tracker</span>
          <h1>Type an expense the way you naturally speak.</h1>
          <p>
            Add entries like <strong>&quot;Zomato 350&quot;</strong> or
            <strong> &quot;200 ka chai&quot;</strong>, then get clean summaries, charts,
            and smart weekly insights.
          </p>
        </div>
        <Link href="/dashboard" className={styles.dashboardLink}>
          Open full dashboard
        </Link>
      </section>

      <ExpenseAppShell showHeader={false} />
    </main>
  );
}
