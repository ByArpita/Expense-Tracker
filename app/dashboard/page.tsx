import Link from "next/link";
import { ExpenseAppShell } from "@/components/expense-app-shell";
import styles from "./page.module.scss";

export default function DashboardPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Dashboard</span>
          <h1>Your spending, only your data</h1>
          <p>Review your personal trends, categories, and recent activity after signing in securely.</p>
        </div>
        <Link href="/" className={styles.homeLink}>
          Back to quick add
        </Link>
      </header>

      <ExpenseAppShell showHeader />
    </main>
  );
}
