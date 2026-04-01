import { format } from "date-fns";
import styles from "./expense-list.module.scss";
import type { ExpenseRecord } from "@/lib/types";

type ExpenseListProps = {
  expenses: ExpenseRecord[];
  title?: string;
  subtitle?: string;
  showOwner?: boolean;
  onDeleteExpense?: (expenseId: string) => void;
  deletingExpenseId?: string | null;
};

function formatExpenseMeta(createdAt: string) {
  const date = new Date(createdAt);

  if (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  ) {
    return format(date, "MMM d");
  }

  return format(date, "p");
}

export function ExpenseList({
  expenses,
  title = "Today's expenses",
  subtitle,
  showOwner = false,
  onDeleteExpense,
  deletingExpenseId = null
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
            <div className={styles.itemMain}>
              <div>
                <strong>{expense.description}</strong>
                <p>
                  {showOwner ? `${expense.userName} - ` : ""}
                  {expense.category} - {formatExpenseMeta(expense.createdAt)}
                </p>
              </div>
            </div>
            <div className={styles.itemActions}>
              <span>Rs. {expense.amount.toFixed(0)}</span>
              {onDeleteExpense ? (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onDeleteExpense(expense.id)}
                  disabled={deletingExpenseId === expense.id}
                  aria-label={`Remove ${expense.description}`}
                  title="Remove expense"
                >
                  {deletingExpenseId === expense.id ? "..." : "x"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}