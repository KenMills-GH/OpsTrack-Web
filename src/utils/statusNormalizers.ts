export function normalizeTaskStatusForUi(status?: string): string {
  const normalized = (status || "PENDING").toUpperCase();
  if (normalized === "IN_PROGRESS") return "ACTIVE";
  if (normalized === "COMPLETED") return "RESOLVED";
  return normalized;
}
