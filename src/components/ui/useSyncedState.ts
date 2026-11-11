import { useState } from "react";

/**
 * Local state that starts from a prop and follows the prop when the parent
 * changes it. (React's recommended pattern for this: compare during render
 * instead of copying the prop in an effect.)
 */
export function useSyncedState<T>(prop: T) {
  const [state, setState] = useState(prop);
  const [seen, setSeen] = useState(prop);
  if (seen !== prop) {
    setSeen(prop);
    setState(prop);
  }
  return [state, setState] as const;
}
