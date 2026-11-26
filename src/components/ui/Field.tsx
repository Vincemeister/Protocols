import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface FieldProps {
  id?: string;
  /** Form field name, so the value is submitted with its form. */
  name?: string;
  label?: string;
  optional?: boolean;
  help?: string;
  /** Replaces help; turns the field red. */
  error?: string;
  /** Beyond index.d.ts (phase 3): replaces help with a green confirmation ("Available. …"), as on the welcome screen. */
  success?: string;
  maxLength?: number;
  /** Beyond index.d.ts (phase 3): keeps the limit but hides the "12 / 40" counter, as the designed forms do on short fields. */
  hideCount?: boolean;
  disabled?: boolean;
}

interface FieldShellProps extends FieldProps {
  id: string;
  /** Current length of the value, for the "12 / 40" counter. */
  length?: number;
  /** Placed between the label and the control (the Listening bar). */
  before?: ReactNode;
  /** Placed after the help line (the Tidied bar). */
  after?: ReactNode;
  children: ReactNode;
}

/** Label above, control, then help or error and an optional counter. Shared by every form control. */
export function FieldShell({ id, label, optional, help, error, success, maxLength: limit, hideCount, length = 0, before, after, children }: FieldShellProps) {
  const maxLength = hideCount ? undefined : limit;
  return (
    <div className={cx("fv-field", error && "is-error")}>
      {label ? (
        <label className="fv-label" htmlFor={id}>
          {label}
          {optional ? <span className="fv-optional">Optional</span> : null}
        </label>
      ) : null}
      {before}
      {children}
      {error || success || help || maxLength ? (
        <div className="fv-help">
          <span id={`${id}-help`}>
            {error ? (
              <>
                <Icon name="alert-triangle" size="sm" />
                {error}
              </>
            ) : success ? (
              <span style={{ color: "var(--success)" }}>
                <Icon name="check" style={{ width: 14, height: 14, verticalAlign: -2, marginRight: "var(--space-1)" }} />
                {success}
              </span>
            ) : (
              help || ""
            )}
          </span>
          {maxLength ? <span className="fv-count">{length} / {maxLength}</span> : null}
        </div>
      ) : null}
      {after}
    </div>
  );
}
