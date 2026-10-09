import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Detail, User, Workshop } from "../types";
import { api, json, dateTime } from "../api";
import { Badge, ErrorNotice } from "./Shared";
export function WorkshopDetail({
  id,
  user,
  onClose,
  onChanged,
  onEdit,
}: {
  id: string;
  user: User;
  onClose: () => void;
  onChanged: () => void;
  onEdit: (workshop: Workshop) => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"attendees" | "history" | "changes">(
    "attendees",
  );
  const [form, setForm] = useState({ attendeeName: "", attendeeEmail: "" });
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDetail(await api(`/workshops/${id}`));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  async function register(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(
        `/workshops/${id}/registrations`,
        json("POST", { ...form, requestId }),
      );
      setForm({ attendeeName: "", attendeeEmail: "" });
      setRequestId(crypto.randomUUID());
      setMessage("Attendee registered. Their seat is confirmed.");
      await load();
      onChanged();
    } catch (error) {
      setError((error as Error).message);
      await load();
      onChanged();
    } finally {
      setBusy(false);
    }
  }
  async function cancel(event: FormEvent) {
    event.preventDefault();
    if (!cancelId) return;
    setBusy(true);
    setError("");
    try {
      await api(`/registrations/${cancelId}/cancel`, json("POST", { reason }));
      setCancelId(null);
      setReason("");
      setMessage("Registration cancelled. The seat is available again.");
      await load();
      onChanged();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!detail)
    return (
      <section className="panel">
        <button className="secondary" onClick={onClose}>
          ← Back to workshops
        </button>
        <ErrorNotice message={error} />
        {loading && (
          <p className="muted" role="status">
            Loading workshop…
          </p>
        )}
      </section>
    );
  const w = detail.workshop;
  const canRegister =
    w.status === "SCHEDULED" &&
    new Date(w.startsAt).getTime() > Date.now() &&
    w.available > 0;
  return (
    <>
      <section className="detail-hero">
        <div>
          <button className="back-button" onClick={onClose}>
            ← All workshops
          </button>
          <p className="eyebrow">
            {w.code} · {w.location}
          </p>
          <h1>{w.title}</h1>
          <p>
            {w.instructor} · {dateTime(w.startsAt)} (Sri Lanka)
          </p>
          <div className="detail-badges">
            <Badge tone={w.status.toLowerCase()}>{w.status}</Badge>
            <span>
              {w.activeCount} / {w.capacity} seats booked
            </span>
          </div>
        </div>
        <div className="seat-summary">
          <strong>{w.available}</strong>
          <span>seats available</span>
          {user.role === "MANAGER" && (
            <button className="secondary" onClick={() => onEdit(w)}>
              Edit workshop
            </button>
          )}
        </div>
      </section>
      <ErrorNotice message={error} />
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Register an attendee</h2>
            <p className="muted">Add their details and confirm a seat.</p>
          </div>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void load()}
          >
            Refresh seats
          </button>
        </div>
        {canRegister ? (
          <form onSubmit={register}>
            <fieldset disabled={busy}>
              <div className="registration-form">
                <label>
                  Attendee name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.attendeeName}
                    onChange={(event) => {
                      setForm({ ...form, attendeeName: event.target.value });
                      setRequestId(crypto.randomUUID());
                    }}
                  />
                </label>
                <label>
                  Attendee email
                  <input
                    required
                    type="email"
                    maxLength={200}
                    value={form.attendeeEmail}
                    onChange={(event) => {
                      setForm({ ...form, attendeeEmail: event.target.value });
                      setRequestId(crypto.randomUUID());
                    }}
                  />
                </label>
                <button disabled={busy}>
                  {busy ? "Registering…" : "Confirm registration →"}
                </button>
              </div>
            </fieldset>
          </form>
        ) : (
          <p className="empty compact">
            {w.available === 0
              ? "This workshop is full. Cancelling a registration frees a seat."
              : "Registrations are closed for this workshop."}
          </p>
        )}
      </section>
      {cancelId && (
        <section className="panel cancellation-panel">
          <h2>Cancel this registration?</h2>
          <p className="muted">
            The record stays in history. Its seat will become available.
          </p>
          <form onSubmit={cancel}>
            <label>
              Reason (optional)
              <input
                maxLength={300}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <div className="form-actions">
              <button disabled={busy}>
                {busy ? "Cancelling…" : "Confirm cancellation"}
              </button>
              <button
                disabled={busy}
                type="button"
                className="secondary"
                onClick={() => setCancelId(null)}
              >
                Keep registration
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="panel">
        <div className="tabs">
          <button
            className={tab === "attendees" ? "selected" : ""}
            onClick={() => setTab("attendees")}
          >
            Attendees ({detail.registrations.length})
          </button>
          <button
            className={tab === "history" ? "selected" : ""}
            onClick={() => setTab("history")}
          >
            Registration history
          </button>
          <button
            className={tab === "changes" ? "selected" : ""}
            onClick={() => setTab("changes")}
          >
            Workshop changes
          </button>
        </div>
        {loading && (
          <p className="muted" role="status">
            Refreshing…
          </p>
        )}
        {tab === "attendees" && (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Status</th>
                    <th>Registered by / when</th>
                    <th>Cancelled by / when</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {detail.registrations.map((registration) => (
                    <tr key={registration._id}>
                      <td>
                        <strong>{registration.attendeeName}</strong>
                        <small>{registration.attendeeEmail}</small>
                      </td>
                      <td>
                        <Badge tone={registration.status.toLowerCase()}>
                          {registration.status}
                        </Badge>
                      </td>
                      <td>
                        {registration.registeredBy?.name ?? "Staff member"}
                        <small>{dateTime(registration.registeredAt)}</small>
                      </td>
                      <td>
                        {registration.cancelledBy?.name ?? "—"}
                        {registration.cancelledAt && (
                          <small>{dateTime(registration.cancelledAt)}</small>
                        )}
                        {registration.cancellationReason && (
                          <small>{registration.cancellationReason}</small>
                        )}
                      </td>
                      <td>
                        {registration.status === "ACTIVE" && (
                          <button
                            className="secondary"
                            disabled={busy}
                            onClick={() => {
                              setCancelId(registration._id);
                              setReason("");
                            }}
                          >
                            Cancel registration
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {detail.registrations.length === 0 && (
              <p className="empty">
                No attendees yet. Register the first person above.
              </p>
            )}
          </>
        )}
        {tab === "history" && (
          <div className="timeline">
            {detail.history.length === 0 && (
              <p className="empty">Registration activity will appear here.</p>
            )}
            {detail.history.map((event) => (
              <article key={event._id}>
                <span className={"timeline-dot " + event.event.toLowerCase()} />
                <div>
                  <strong>
                    {event.registrationId?.attendeeName ?? "Attendee"} ·{" "}
                    {event.event === "REGISTERED" ? "Registered" : "Cancelled"}
                  </strong>
                  <p>
                    {event.actorId?.name ?? "Staff member"} ·{" "}
                    {event.registrationId?.attendeeEmail ?? ""}
                  </p>
                  <small>
                    {dateTime(event.occurredAt)}
                    {event.note ? " · " + event.note : ""}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === "changes" && (
          <div className="timeline">
            {detail.audit.length === 0 && (
              <p className="empty">No workshop changes recorded yet.</p>
            )}
            {detail.audit.map((event) => (
              <article key={event._id}>
                <span className="timeline-dot" />
                <div>
                  <strong>
                    {event.action === "WORKSHOP_CREATED"
                      ? "Workshop created"
                      : "Workshop updated"}
                  </strong>
                  <p>{event.actorId?.name ?? "Manager"}</p>
                  <small>{dateTime(event.occurredAt)}</small>
                  <details>
                    <summary>View recorded details</summary>
                    <pre>{JSON.stringify(event.details, null, 2)}</pre>
                  </details>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
