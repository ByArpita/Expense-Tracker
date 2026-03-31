import { format } from "date-fns";
import styles from "./expense-list.module.scss";
import type { ExpenseRecord } from "@/lib/types";

type ExpenseListProps = {
  expenses: ExpenseRecord[];
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <h3>Today&apos;s expenses</h3>
        <span>{expenses.length} entries</span>
      </div>
      <div className={styles.list}>
        {expenses.map((expense) => (
          <article key={expense.id} className={styles.item}>
            <div>
              <strong>{expense.description}</strong>
              <p>
                {expense.category} · {format(new Date(expense.createdAt), "p")}
              </p>
            </div>
            <span>₹{expense.amount.toFixed(0)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
