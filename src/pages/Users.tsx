import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User, Role, Audit } from "../types";
import { api, json, dateTime } from "../api";
import { Badge, ErrorNotice, Heading } from "../components/Shared";
export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<Audit[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as Role,
  });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accounts, audit] = await Promise.all([
        api<{ data: User[] }>("/users"),
        api<{ data: Audit[] }>("/users/history"),
      ]);
      setUsers(accounts.data);
      setHistory(audit.data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/users", json("POST", form));
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      setShowForm(false);
      setMessage(
        "Account created. Share the password with the staff member securely.",
      );
      await load();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="ACCOUNT ADMINISTRATION"
        title="The people behind your programme."
        description="Create staff accounts and give each person the right level of access."
      />
      <div className="admin-note">
        <strong>Your role: Administrator</strong>
        <p>
          You manage accounts. Workshop operations are available to Managers and
          Staff.
        </p>
      </div>
      <div className="toolbar">
        <span>{users.length} accounts</span>
        <button onClick={() => setShowForm(!showForm)}>+ Create account</button>
      </div>
      <ErrorNotice message={error} />
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {showForm && (
        <section className="panel">
          <h2>New staff account</h2>
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              <div className="form-grid">
                <label>
                  Name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    maxLength={200}
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                  />
                </label>
                <label>
                  Initial password
                  <input
                    required
                    type="password"
                    minLength={10}
                    maxLength={200}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                  />
                </label>
                <label>
                  Role
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value as Role })
                    }
                  >
                    <option value="STAFF">
                      Staff — registrations and history
                    </option>
                    <option value="MANAGER">
                      Manager — workshops and registrations
                    </option>
                    <option value="ADMIN">Admin — account creation only</option>
                  </select>
                </label>
              </div>
              <div className="form-actions">
                <button disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Staff directory</h2>
          <button className="secondary" onClick={() => void load()}>
            Refresh
          </button>
        </div>
        {loading && (
          <p className="muted" role="status">
            Loading accounts…
          </p>
        )}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge>{user.role}</Badge>
                  </td>
                  <td>{user.createdAt ? dateTime(user.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>Account activity</h2>
        <p className="muted">
          The latest account creations, recorded with who and when.
        </p>
        {history.length === 0 ? (
          <p className="empty">New account activity will appear here.</p>
        ) : (
          <div className="timeline">
            {history.map((event) => (
              <article key={event._id}>
                <span className="timeline-dot" />
                <div>
                  <strong>
                    {event.actorId?.name ?? "Staff member"} created an account
                  </strong>
                  <p>
                    {String(event.details.name ?? "")} ·{" "}
                    {String(event.details.role ?? "")}
                  </p>
                  <small>{dateTime(event.occurredAt)}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
