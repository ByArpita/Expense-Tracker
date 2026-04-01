"use client";

import { useState } from "react";
import styles from "./auth-panel.module.scss";
import type { SessionResponse } from "@/lib/types";

type AuthPanelProps = {
  onSignedIn: (response: SessionResponse) => void;
};

type AuthMode = "signin" | "signup";

export function AuthPanel({ onSignedIn }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify(
          mode === "signup"
            ? { mode, email, password, name: name.trim() }
            : { mode, email, password }
        )
      });

      const payload = (await response.json()) as SessionResponse | { error: string };
      if (!response.ok || !("user" in payload)) {
        const message = "error" in payload ? payload.error : "Unable to sign in.";
        throw new Error(message);
      }

      onSignedIn(payload);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="login" className={styles.panel}>
      <div className={styles.copy}>
        <span className={styles.badge}>Secure Access</span>
        <h2>{mode === "signup" ? "Create your expense account" : "Sign in to your dashboard"}</h2>
        <p>
          Your expenses stay private to your account. Use your email and password to access the
          same dashboard from any device.
        </p>
      </div>

      <div className={styles.modeSwitch}>
        <button
          type="button"
          className={mode === "signup" ? styles.modeActive : undefined}
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
        >
          Create account
        </button>
        <button
          type="button"
          className={mode === "signin" ? styles.modeActive : undefined}
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
        >
          Sign in
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
            />
          </label>
        ) : null}
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
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting
            ? mode === "signup"
              ? "Creating account..."
              : "Signing in..."
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </form>
    </section>
  );
}
