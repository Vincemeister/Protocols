"use client";

export interface ChoiceProps {
  label: string;
  help?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  onChange?: (checked: boolean) => void;
}

function Choice({ kind, label, help, checked, disabled, name, onChange }: ChoiceProps & { kind: "fv-checkbox" | "fv-toggle" }) {
  const input = (
    <input
      className={kind}
      type="checkbox"
      role={kind === "fv-toggle" ? "switch" : undefined}
      name={name}
      defaultChecked={!!checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
  const text = (
    <span className="fv-choice-text">
      {label}
      {help ? <span className="fv-choice-help">{help}</span> : null}
    </span>
  );
  // A toggle sits to the right of its label; a checkbox to the left.
  return <label className="fv-choice">{kind === "fv-toggle" ? <>{text}{input}</> : <>{input}{text}</>}</label>;
}

export function Checkbox(props: ChoiceProps) { return <Choice kind="fv-checkbox" {...props} />; }
export function Toggle(props: ChoiceProps) { return <Choice kind="fv-toggle" {...props} />; }
