import { useState, type FormEvent } from "react";
import { api, json } from "../api";
import type { User } from "../types";
import { ErrorNotice } from "../components/Shared";
export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("staff@workshop.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ user: User }>(
        "/auth/login",
        json("POST", { email, password }),
      );
      onLogin(result.user);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-layout">
      <section className="login-story">
        <div className="brand">
          <img src="/gather-logo-on-navy.webp" alt="Gather" className="brand-logo" />
          <span className="brand-text">ather<span className="brand-dot">.</span></span>
        </div>
        <div>
          <p className="eyebrow">COMMUNITY LEARNING, TOGETHER</p>
          <h1>
            A place for every
            <br />
            curious mind.
          </h1>
          <p>
            Keep workshops organized.
            <br />
            Welcome attendees with confidence.
          </p>
          <div className="story-card">
            <span className="status-dot" />
            Every seat accounted for.
            <small>Across your three learning centres.</small>
          </div>
        </div>
        <p className="muted-light">
          Workshop Registration Service · Staff workspace
        </p>
      </section>
      <section className="login-form">
        <p className="eyebrow">WELCOME TO YOUR WORKSPACE</p>
        <h2>Good to see you.</h2>
        <p className="muted">Sign in with your staff account to get started.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <ErrorNotice message={error} />
          <button disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button>
        </form>
        <p className="login-help">
          Accounts are created by your administrator.
          <br />
          For assessment demo credentials, see the README.
        </p>
        <div className="demo-emails">
          <button
            className="text-button"
            onClick={() => setEmail("admin@workshop.local")}
          >
            Admin email
          </button>
          <button
            className="text-button"
            onClick={() => setEmail("manager@workshop.local")}
          >
            Manager email
          </button>
          <button
            className="text-button"
            onClick={() => setEmail("staff@workshop.local")}
          >
            Staff email
          </button>
        </div>
      </section>
    </main>
  );
}
