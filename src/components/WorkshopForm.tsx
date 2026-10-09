import { useState, type FormEvent } from "react";
import type { Workshop, WorkshopStatus } from "../types";
import { api, json, localDateTime } from "../api";
import { ErrorNotice } from "./Shared";
export function WorkshopForm({
  workshop,
  onSaved,
  onCancel,
}: {
  workshop?: Workshop;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    code: workshop?.code ?? "",
    title: workshop?.title ?? "",
    instructor: workshop?.instructor ?? "",
    location: workshop?.location ?? "Kandy Centre",
    startsAt: workshop ? localDateTime(workshop.startsAt) : "",
    capacity: String(workshop?.capacity ?? 20),
    status: workshop?.status ?? "SCHEDULED",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        capacity: Number(form.capacity),
        ...(workshop ? { expectedVersion: workshop.version } : {}),
      };
      await api(
        workshop ? `/workshops/${workshop._id}` : "/workshops",
        json(workshop ? "PATCH" : "POST", body),
      );
      onSaved();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{workshop ? "Edit workshop" : "Create a workshop"}</h2>
          <p className="muted">
            Keep the programme details clear for your front desk.
          </p>
        </div>
        <button className="secondary" disabled={busy} onClick={onCancel}>
          Close
        </button>
      </div>
      <ErrorNotice message={error} />
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className="form-grid">
            <label>
              Workshop code
              <input
                required
                minLength={2}
                maxLength={40}
                pattern="[A-Za-z0-9_-]+"
                placeholder="POT-102"
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value })
                }
              />
            </label>
            <label>
              Title
              <input
                required
                minLength={2}
                maxLength={160}
                placeholder="Introduction to Pottery"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </label>
            <label>
              Instructor
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.instructor}
                onChange={(event) =>
                  setForm({ ...form, instructor: event.target.value })
                }
              />
            </label>
            <label>
              Location
              <input
                required
                minLength={2}
                maxLength={100}
                list="centres"
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
              />
              <datalist id="centres">
                <option>Kandy Centre</option>
                <option>Colombo Centre</option>
                <option>Galle Centre</option>
              </datalist>
            </label>
            <label>
              Date & time (your device timezone)
              <input
                required
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm({ ...form, startsAt: event.target.value })
                }
              />
            </label>
            <label>
              Capacity
              <input
                required
                type="number"
                min={workshop ? Math.max(1, workshop.activeCount) : 1}
                max="10000"
                step="1"
                value={form.capacity}
                onChange={(event) =>
                  setForm({ ...form, capacity: event.target.value })
                }
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as WorkshopStatus,
                  })
                }
              >
                <option>SCHEDULED</option>
                <option>COMPLETED</option>
                <option>CANCELLED</option>
              </select>
            </label>
          </div>
          {workshop && (
            <p className="muted form-hint">
              {workshop.activeCount} active registrations. Changing workshop
              status preserves attendee records and does not cancel them
              automatically.
            </p>
          )}
          <div className="form-actions">
            <button disabled={busy}>
              {busy ? "Saving…" : "Save workshop"}
            </button>
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
