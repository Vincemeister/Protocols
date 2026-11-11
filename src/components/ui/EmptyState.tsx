import { Button, type ButtonProps } from "./Button";
import { Icon, type IconName } from "./Icon";

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ButtonProps;
}

export function EmptyState({ icon = "list", title, message, action }: EmptyStateProps) {
  return (
    <div className="fv-empty">
      <Icon name={icon} />
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {action ? <Button variant="primary" {...action} /> : null}
    </div>
  );
}
