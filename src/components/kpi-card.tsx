import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "accent" | "warning" | "danger";
  className?: string;
}) {
  const toneClass = {
    default: "from-card to-card",
    accent: "from-accent/10 to-card",
    warning: "from-warning/10 to-card",
    danger: "from-destructive/10 to-card",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 shadow-sm",
        toneClass,
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tabular tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
