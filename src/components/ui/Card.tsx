import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card p-4", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "dark" }) {
  const toneClass = {
    neutral: "border border-border text-ink-soft",
    accent: "bg-maroon-light text-maroon",
    dark: "bg-ink text-bone",
  }[tone];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-control px-2.5 py-1 text-xs font-medium",
        toneClass,
        className,
      )}
      {...props}
    />
  );
}
