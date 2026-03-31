export const QUERY_KEYS = {
  tasks: ["tasks"] as const,
  tasksDashboard: (page: number, sortField: string, sortDirection: string) =>
    ["tasks", page, sortField, sortDirection] as const,
  task: (id: string | number | undefined) => ["task", id] as const,
  users: ["users"] as const,
  usersPage: (page: number) => ["users", page] as const,
  user: (id: string | number | undefined) => ["user", id] as const,
  allAuditLogs: (page: number) => ["all-audit-logs", page] as const,
  taskAuditLogs: (id: string | number | undefined, limit: number) =>
    ["task-audit-logs", id, limit] as const,
};
