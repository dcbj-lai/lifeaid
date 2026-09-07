import { useEffect, useRef, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`la-pill ${tone}`}>{children}</span>;
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="la-empty">
      <CheckCircle2 size={28} />
      <p>{children}</p>
    </div>
  );
}
export function PanelTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="la-panel-title">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function Dialog({
  title,
  subtitle,
  close,
  children,
}: {
  title: string;
  subtitle: string;
  close: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="la-modal"
      onClick={close}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
        if (e.key === "Tab") {
          const targets = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]",
            ) || [],
          );
          const first = targets[0];
          const last = targets[targets.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <section
        ref={dialogRef}
        className="la-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            autoFocus
            className="la-icon"
            aria-label="Close dialog"
            onClick={close}
          >
            <X size={22} />
          </button>
        </header>
        <div className="la-dialog-body">{children}</div>
      </section>
    </div>
  );
}
export function Field({
  label,
  name,
  type = "text",
  area = false,
  required = false,
  value,
  placeholder,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  area?: boolean;
  required?: boolean;
  value?: string | number;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div className="la-field">
      <label htmlFor={"field-" + name}>{label}</label>
      {area ? (
        <textarea
          id={"field-" + name}
          name={name}
          required={required}
          defaultValue={value}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={"field-" + name}
          name={name}
          type={type}
          required={required}
          defaultValue={value}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>
  );
}
