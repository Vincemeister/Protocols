/* eslint-disable @next/next/no-img-element */
import type { MouseEventHandler } from "react";
import { Button } from "./Button";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface ImageUploaderProps {
  src?: string;
  label?: string;
  hint?: string;
  /** 16:9 for list covers on desktop. */
  wide?: boolean;
  onPick?: MouseEventHandler<HTMLElement>;
  onRemove?: MouseEventHandler<HTMLElement>;
}

export function ImageUploader({ src, label = "Add an image", hint = "Square, at least 600px", wide, onPick, onRemove }: ImageUploaderProps) {
  const target = (
    <button
      className={cx("fv-uploader", src && "has-image", wide && "fv-uploader-wide")}
      type="button"
      aria-label={src ? "Replace image" : label}
      onClick={onPick}
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <>
          <Icon name="upload" />
          <span>{label}</span>
          <span>{hint}</span>
        </>
      )}
    </button>
  );
  if (!src) return target;
  return (
    <div>
      {target}
      <div className="fv-uploader-actions">
        <Button variant="tertiary" size="sm" label="Replace" onClick={onPick} />
        <Button variant="link" size="sm" label="Remove" onClick={onRemove} />
      </div>
    </div>
  );
}
