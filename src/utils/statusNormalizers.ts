export function normalizeTaskStatusForUi(status?: string): string {
  return (status || "PENDING").toUpperCase();
}
