// Simple flat-rate loan calculator. Interest = principal * rate_pct/100 (term-based, single bullet for v1).
export function computeLoan(principal: number, ratePct: number, termDays: number) {
  const interest = Math.round((principal * ratePct) / 100);
  const total = principal + interest;
  const due = new Date(Date.now() + termDays * 86400 * 1000);
  return { principal, interest, total, dueDate: due.toISOString().slice(0, 10) };
}
