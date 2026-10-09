import type { ReactNode } from "react";
export function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <p className="notice error" role="alert">
      {message}
    </p>
  ) : null;
}
export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted">{description}</p>
    </header>
  );
}
export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <span>
        {total} workshops · Page {page} of {Math.max(1, Math.ceil(total / 20))}
      </span>
      <div>
        <button
          className="secondary"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="secondary"
          disabled={page * 20 >= total}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
