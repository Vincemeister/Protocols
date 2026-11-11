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
  maxLength?: number;
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
export function FieldShell({ id, label, optional, help, error, maxLength, length = 0, before, after, children }: FieldShellProps) {
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
      {error || help || maxLength ? (
        <div className="fv-help">
          <span id={`${id}-help`}>
            {error ? (
              <>
                <Icon name="alert-triangle" size="sm" />
                {error}
              </>
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
