import Link from "next/link";
import { ExpenseAppShell } from "@/components/expense-app-shell";
import styles from "./page.module.scss";

export default function DashboardPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Dashboard</span>
          <h1>Spending at a glance</h1>
          <p>Track today, compare this week, and spot patterns before they grow.</p>
        </div>
        <Link href="/" className={styles.homeLink}>
          Back to quick add
        </Link>
      </header>

      <ExpenseAppShell showHeader />
    </main>
  );
}
