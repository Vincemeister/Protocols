import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type Tone = "success" | "warning" | "danger";

export interface BadgeProps {
  label: string;
  tone?: "accent" | Tone;
  icon?: IconName;
}

export function Badge({ label, tone, icon }: BadgeProps) {
  return (
    <span className={cx("fv-badge", tone && `fv-badge-${tone}`)}>
      {icon ? <Icon name={icon} /> : null}
      {label}
    </span>
  );
}
