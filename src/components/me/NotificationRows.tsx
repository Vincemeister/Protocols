import { Button, NotificationRow } from "@/components/ui";
import { markAllRead } from "@/lib/me/actions";
import "./me.css";

export interface NotificationItem { id: string; actor: { name: string; avatar?: string }; message: string; time: string; read: boolean; href: string }

/** C11: the rows, with "Mark all read" above them while something is unread. */
export function NotificationRows({ items }: { items: NotificationItem[] }) {
  return (
    <div className="me-notifications">
      {items.some((n) => !n.read) ? (
        <form action={markAllRead} className="me-pad" style={{ paddingBottom: 0, alignItems: "flex-end" }}>
          <Button type="submit" variant="link" size="sm" icon="check" label="Mark all read" />
        </form>
      ) : null}
      {items.map((n) => <NotificationRow key={n.id} actor={n.actor} message={n.message} time={n.time} read={n.read} href={n.href} />)}
    </div>
  );
}
