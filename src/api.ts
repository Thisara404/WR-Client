export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch("/api" + path, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  const data = await response.json();
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      path !== "/auth/me"
    )
      window.dispatchEvent(new Event("session-expired"));
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message;
    const issue = data.issues?.[0];
    throw new Error(
      issue
        ? `${issue.path.join(".") || "Input"}: ${issue.message}`
        : message || "Request failed.",
    );
  }
  return data as T;
}
export const json = (method: string, body: unknown = {}): RequestInit => ({
  method,
  body: JSON.stringify(body),
});
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
export function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
