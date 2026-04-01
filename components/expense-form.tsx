"use client";

import { useState } from "react";
import styles from "./expense-form.module.scss";
import type { ExpenseRecord, UserProfile } from "@/lib/types";

type ExpenseFormProps = {
  activeUser: UserProfile | null;
  onExpenseAdded: (expense: ExpenseRecord) => void;
};

const sampleInputs = ["Spent 200 on food", "Petrol 500", "200 ka chai", "Zomato 350"];

export function ExpenseForm({ activeUser, onExpenseAdded }: ExpenseFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = text.trim();
    if (!value) {
      setError("Type an expense like 'Petrol 500' to continue.");
      return;
    }

    if (!activeUser) {
      setError("Sign in before saving an expense.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: value })
      });

      const payload = (await response.json()) as { expense: ExpenseRecord } | { error: string };

      if (!response.ok) {
        const message = "error" in payload ? payload.error : "Unable to save expense.";
        throw new Error(message);
      }

      if (!("expense" in payload)) {
        throw new Error("Unexpected API response while saving expense.");
      }

      onExpenseAdded(payload.expense);
      setText("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while saving the expense."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>Quick Add</span>
          <h2>Log an expense in one line</h2>
        </div>
        <p>
          Your dashboard is private to your account. Add an expense naturally and the app will
          keep your personal history ready the next time you sign in.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="expense-input">
          Expense text
        </label>
        <div className={styles.inputRow}>
          <input
            id="expense-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Try 'Dinner with team 850 yesterday'"
            autoComplete="off"
            disabled={!activeUser || submitting}
          />
          <button type="submit" disabled={!activeUser || submitting}>
            {submitting ? "Saving..." : "Add expense"}
          </button>
        </div>
        <div className={styles.samples}>
          {sampleInputs.map((sample) => (
            <button
              key={sample}
              type="button"
              className={styles.sample}
              onClick={() => setText(sample)}
              disabled={!activeUser || submitting}
            >
              {sample}
            </button>
          ))}
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </form>
    </section>
  );
}
