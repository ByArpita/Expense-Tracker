import { format } from "date-fns";
import styles from "./expense-list.module.scss";
import type { ExpenseRecord } from "@/lib/types";

type ExpenseListProps = {
  expenses: ExpenseRecord[];
  title?: string;
  subtitle?: string;
  showOwner?: boolean;
};

export function ExpenseList({
  expenses,
  title = "Today's expenses",
  subtitle,
  showOwner = false
}: ExpenseListProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <span>{expenses.length} entries</span>
      </div>
      <div className={styles.list}>
        {expenses.map((expense) => (
          <article key={expense.id} className={styles.item}>
            <div>
              <strong>{expense.description}</strong>
              <p>
                {showOwner ? `${expense.userName} - ` : ""}
                {expense.category} - {format(new Date(expense.createdAt), "p")}
              </p>
            </div>
            <span>Rs. {expense.amount.toFixed(0)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}