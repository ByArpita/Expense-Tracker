"use client";

import { useState } from "react";
import styles from "./auth-panel.module.scss";
import type { SessionResponse } from "@/lib/types";

type AuthPanelProps = {
  onSignedIn: (response: SessionResponse) => void;
};

export function AuthPanel({ onSignedIn }: AuthPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, name: name.trim() || undefined })
      });

      const payload = (await response.json()) as SessionResponse | { error: string };
      if (!response.ok || !("user" in payload)) {
        const message = "error" in payload ? payload.error : "Unable to login.";
        throw new Error(message);
      }

      onSignedIn(payload);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="login" className={styles.panel}>
      <div className={styles.copy}>
        <span className={styles.badge}>Personal Access</span>
        <h2>Open your dashboard with your email</h2>
        <p>
          Your expenses stay private to your account. Use the same email on any device to
          get back to your personal dashboard.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Opening..." : "Open my dashboard"}
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </form>
    </section>
  );
}