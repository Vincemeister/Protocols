import { useId, type MouseEventHandler, type ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface DialogProps {
  title: string;
  /** A sentence, or any content (a form field in a sheet). */
  body?: ReactNode;
  actions?: ButtonProps[];
  onClose?: MouseEventHandler<HTMLElement>;
  /** role=alertdialog for destructive confirmations. */
  alert?: boolean;
}

function DialogBox({ title, body, actions, onClose, alert, sheet }: DialogProps & { sheet?: boolean }) {
  const titleId = useId();
  return (
    <div className={cx("fv-dialog", sheet && "fv-sheet")} role={alert ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby={titleId}>
      {sheet ? <div className="fv-sheet-handle" /> : null}
      <div className="fv-dialog-head">
        <h2 className="fv-dialog-title" id={titleId}>{title}</h2>
        {!sheet ? (
          <button className="fv-icon-btn" type="button" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </button>
        ) : null}
      </div>
      <div className="fv-dialog-body">{typeof body === "string" ? <p>{body}</p> : body}</div>
      <div className="fv-dialog-foot">
        {(actions || []).map((a) => <Button key={a.label} {...a} />)}
      </div>
    </div>
  );
}

/** The modal box (desktop). Place it over a .fv-scrim inside a .fv-dialog-stage. */
export function Dialog(props: DialogProps) { return <DialogBox {...props} />; }

/** The same content as a bottom sheet (mobile). */
export function Sheet(props: DialogProps) { return <DialogBox {...props} sheet />; }
