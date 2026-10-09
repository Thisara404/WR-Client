import { useEffect, useState } from "react";
import type { List, User, Workshop } from "../types";
import { api, dateTime } from "../api";
import { Badge, ErrorNotice, Heading, Pagination } from "../components/Shared";
import { WorkshopDetail } from "../components/WorkshopDetail";
import { WorkshopForm } from "../components/WorkshopForm";
export function Workshops({ user }: { user: User }) {
  const [filters, setFilters] = useState({
    search: "",
    from: "",
    to: "",
    status: "",
    available: false,
  });
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [list, setList] = useState<List<Workshop> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Workshop | undefined>();
  const [showForm, setShowForm] = useState(false);
  const params = new URLSearchParams({
    page: String(page),
    search: filters.search,
    available: String(filters.available),
  });
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api<List<Workshop>>("/workshops?" + query, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setList(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError((error as Error).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, revision]);
  function changed() {
    setRevision((value) => value + 1);
  }
  function edit(workshop: Workshop) {
    setEditing(workshop);
    setShowForm(true);
    setSelected(null);
  }
  if (showForm)
    return (
      <>
        <Heading
          eyebrow="PROGRAMME MANAGEMENT"
          title={
            editing ? "Update your workshop." : "Make room for something new."
          }
          description="Set the details your team needs to welcome attendees."
        />
        <WorkshopForm
          key={editing?._id ?? "new"}
          workshop={editing}
          onCancel={() => {
            setShowForm(false);
            changed();
          }}
          onSaved={() => {
            setShowForm(false);
            changed();
          }}
        />
      </>
    );
  if (selected)
    return (
      <WorkshopDetail
        key={selected}
        id={selected}
        user={user}
        onClose={() => {
          setSelected(null);
          changed();
        }}
        onChanged={changed}
        onEdit={edit}
      />
    );
  const visible = list?.data ?? [];
  return (
    <>
      <Heading
        eyebrow="YOUR COMMUNITY PROGRAMME"
        title="Good things are coming up."
        description="Find a workshop, check its seats, and welcome the next attendee."
      />
      <div className="overview-strip">
        <div>
          <strong>{list?.total ?? "—"}</strong>
          <span>matching workshops</span>
        </div>
        <div>
          <strong>
            {visible.filter((w) => w.status === "SCHEDULED").length}
          </strong>
          <span>scheduled on this page</span>
        </div>
        <div>
          <strong>{visible.reduce((sum, w) => sum + w.activeCount, 0)}</strong>
          <span>bookings on this page</span>
        </div>
        {user.role === "MANAGER" && (
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
          >
            + Add workshop
          </button>
        )}
      </div>
      <section className="panel filters">
        <div className="filter-heading">
          <h2>Find your next workshop</h2>
          <button
            className="text-button"
            onClick={() => {
              setFilters({
                search: "",
                from: "",
                to: "",
                status: "",
                available: false,
              });
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>
        <div className="filter-grid">
          <label>
            Search
            <input
              placeholder="Title, code, instructor, centre…"
              value={filters.search}
              onChange={(event) => {
                setFilters({ ...filters, search: event.target.value });
                setPage(1);
              }}
            />
          </label>
          <label>
            From date
            <input
              type="date"
              value={filters.from}
              onChange={(event) => {
                setFilters({ ...filters, from: event.target.value });
                setPage(1);
              }}
            />
          </label>
          <label>
            To date
            <input
              type="date"
              value={filters.to}
              onChange={(event) => {
                setFilters({ ...filters, to: event.target.value });
                setPage(1);
              }}
            />
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(event) => {
                setFilters({ ...filters, status: event.target.value });
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option>SCHEDULED</option>
              <option>COMPLETED</option>
              <option>CANCELLED</option>
            </select>
          </label>
        </div>
        <div className="filter-bottom">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={filters.available}
              onChange={(event) => {
                setFilters({ ...filters, available: event.target.checked });
                setPage(1);
              }}
            />{" "}
            Upcoming workshops with seats available
          </label>
          <small>Dates and displayed times use Sri Lanka time.</small>
        </div>
      </section>
      <ErrorNotice message={error} />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Workshop catalogue</h2>
            <p className="muted">
              Seat counts reflect confirmed, active registrations.
            </p>
          </div>
          <button className="secondary" disabled={loading} onClick={changed}>
            Refresh
          </button>
        </div>
        {loading && (
          <p className="muted" role="status">
            Loading workshops…
          </p>
        )}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Workshop</th>
                <th>When & where</th>
                <th>Seats</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((workshop) => (
                <tr key={workshop._id}>
                  <td>
                    <strong>{workshop.title}</strong>
                    <small>
                      {workshop.code} · {workshop.instructor}
                    </small>
                  </td>
                  <td>
                    {dateTime(workshop.startsAt)}
                    <small>{workshop.location}</small>
                  </td>
                  <td>
                    <div className="seat-label">
                      <strong>
                        {workshop.activeCount} / {workshop.capacity}
                      </strong>
                      <span>{workshop.available} available</span>
                    </div>
                    <div className="seat-bar">
                      <span
                        style={{
                          width: `${Math.min(100, (workshop.activeCount / workshop.capacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <Badge tone={workshop.status.toLowerCase()}>
                      {workshop.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="secondary"
                      onClick={() => setSelected(workshop._id)}
                    >
                      Open workshop →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && visible.length === 0 && (
          <p className="empty">
            No workshops match these filters. Try another date range or clear
            the filters.
          </p>
        )}
        {list && (
          <Pagination page={page} total={list.total} onChange={setPage} />
        )}
      </section>
    </>
  );
}
