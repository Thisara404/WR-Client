export type Role = "ADMIN" | "MANAGER" | "STAFF";
export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};
export type WorkshopStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type Workshop = {
  _id: string;
  code: string;
  title: string;
  instructor: string;
  location: string;
  startsAt: string;
  capacity: number;
  activeCount: number;
  available: number;
  status: WorkshopStatus;
  version: number;
};
export type Registration = {
  _id: string;
  attendeeName: string;
  attendeeEmail: string;
  status: "ACTIVE" | "CANCELLED";
  registeredAt: string;
  registeredBy: { _id: string; name: string };
  cancelledAt: string | null;
  cancelledBy: { _id: string; name: string } | null;
  cancellationReason: string;
};
export type HistoryEvent = {
  _id: string;
  event: "REGISTERED" | "CANCELLED";
  occurredAt: string;
  actorId: { name: string };
  registrationId: { attendeeName: string; attendeeEmail: string };
  note: string;
};
export type Audit = {
  _id: string;
  action: string;
  occurredAt: string;
  actorId: { name: string };
  details: Record<string, unknown>;
};
export type Detail = {
  workshop: Workshop;
  registrations: Registration[];
  history: HistoryEvent[];
  audit: Audit[];
};
export type List<T> = { data: T[]; total: number; page: number; limit: number };
