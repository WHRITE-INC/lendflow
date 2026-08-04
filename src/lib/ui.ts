import { cn } from "@/lib/utils";

export function inputCls(error?: string) {
  return cn(
    "w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[color:var(--color-muted)]/60",
    "focus:border-[color:var(--color-leaf)] focus:ring-2 focus:ring-[color:var(--color-leaf)]/25",
    error ? "border-red-400 ring-2 ring-red-200" : "border-[color:var(--color-line)]",
  );
}

export const money = (n: number) => "K" + Math.round(n).toLocaleString("en-US");
