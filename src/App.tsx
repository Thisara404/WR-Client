import { useEffect, useState } from "react";
import type { User } from "./types";
import { api, json } from "./api";
import { Login } from "./pages/Login";
import { Users } from "./pages/Users";
import { Workshops } from "./pages/Workshops";
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<{ user: User }>("/auth/me")
      .then((result) => {
        if (active) setUser(result.user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    function expired() {
      setUser(null);
    }
    window.addEventListener("session-expired", expired);
    return () => {
      active = false;
      window.removeEventListener("session-expired", expired);
    };
  }, []);
  async function logout() {
    try {
      await api("/auth/logout", json("POST"));
      setUser(null);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    }
  }
  if (loading)
    return (
      <main className="initial-loading">
        <div className="brand">
          <span className="brand-symbol">g</span>gather.
        </div>
        <p>Opening your workspace…</p>
      </main>
    );
  if (!user) return <Login onLogin={setUser} />;
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-symbol">g</span>gather
          <span className="brand-dot">.</span>
        </div>
        <p className="nav-caption">STAFF WORKSPACE</p>
        <nav aria-label="Main navigation">
          <span className="nav-item active">
            <span aria-hidden="true">{user.role === "ADMIN" ? "◉" : "▦"}</span>
            {user.role === "ADMIN" ? "Staff accounts" : "Workshops"}
          </span>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          <strong>Learning brings us together.</strong>
          <p>
            Three centres.
            <br />
            One connected community.
          </p>
        </div>
        <div className="account">
          <span className="avatar">{user.name.slice(0, 1)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
          <button className="text-button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>
            WORKSPACE /{" "}
            <strong>{user.role === "ADMIN" ? "ACCOUNTS" : "WORKSHOPS"}</strong>
          </span>
          <span className="workspace-badge">{user.role}</span>
        </header>
        <main className="content">
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
          {user.role === "ADMIN" ? <Users /> : <Workshops user={user} />}
        </main>
        <footer>
          Gather · Workshop Registration Service
          <span>Every registration. Every seat. Accounted for.</span>
        </footer>
      </div>
    </div>
  );
}
