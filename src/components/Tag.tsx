import type { ReactNode } from "react";
import { clsx } from "clsx";

type TagProps = {
  children: ReactNode;
  tone?: "default" | "signal" | "muted";
};

export function Tag({ children, tone = "default" }: TagProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-line bg-panel text-muted",
        tone === "signal" && "border-signal/40 bg-signal/10 text-signal",
        tone === "muted" && "border-line bg-field text-muted"
      )}
    >
      {children}
    </span>
  );
}
