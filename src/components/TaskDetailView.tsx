import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axios";
import { readOperatorRole } from "../utils/authToken";
import { normalizeTaskStatusForUi } from "../utils/statusNormalizers";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parsePaginatedResponse } from "../api/responseParsers";

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority_level?: string;
  assigned_to?: number | null;
  assignee_name?: string | null;
  created_at?: string;
}

interface AuditLog {
  id: number;
  operator_id?: number | null;
  operator_name?: string | null;
  action: string;
  resource: string;
  details?: string | null;
  logged_at?: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
  };
}

const AUDIT_PAGE_SIZE = 10;

export default function TaskDetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateTask = (location.state as { task?: Task } | undefined)?.task;
  const [auditLimit, setAuditLimit] = useState(AUDIT_PAGE_SIZE);
  const operatorRole = readOperatorRole();

  const {
    data: task,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.task(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data as Task;
    },
    initialData: stateTask,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: auditResponse,
    isLoading: isAuditLoading,
    error: auditError,
  } = useQuery({
    queryKey: QUERY_KEYS.taskAuditLogs(id, auditLimit),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get(`/tasks/${id}/audit-logs`, {
        params: {
          limit: auditLimit,
          offset: 0,
        },
      });

      return parsePaginatedResponse<AuditLog>(
        response.data,
        auditLimit,
        0,
      ) as AuditLogResponse;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const auditLogs = auditResponse?.data || [];
  const hasMoreAuditLogs = Boolean(auditResponse?.meta?.has_next);

  const formatTimestamp = (value?: string) => {
    if (!value) return "Unavailable";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Unavailable";
    return parsed.toLocaleString();
  };
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <section className="mx-auto max-w-3xl border border-[#353437] bg-[#1f1f21] p-6">
        <header className="mb-6 border-b border-[#353437] pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
            Mission Details
          </p>
          <h1 className="mt-2 text-lg font-bold uppercase tracking-widest">
            Task #{id || "UNKNOWN"}
          </h1>
          <p className="mt-2 text-xs text-[#919191] uppercase tracking-widest">
            GET /tasks -&gt; selected task
          </p>
        </header>

        {isLoading && <p className="text-sm text-[#919191]">Loading task...</p>}
        {error && (
          <p className="text-sm text-red-400">Failed to load task list.</p>
        )}
        {!isLoading && !task && (
          <p className="text-sm text-[#919191]">
            Task not found in current response set.
          </p>
        )}

        {task && (
          <div className="space-y-4">
            <div className="border border-[#353437] bg-[#131315] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Summary
              </p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] text-[#919191] uppercase tracking-widest">
                    ID
                  </p>
                  <p className="text-sm font-mono text-[#e5e1e4]">{task.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#919191] uppercase tracking-widest">
                    Status
                  </p>
                  <p className="text-sm font-mono text-[#e5e1e4]">
                    {normalizeTaskStatusForUi(task.status)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#919191] uppercase tracking-widest">
                    Priority
                  </p>
                  <p className="text-sm font-mono text-[#e5e1e4]">
                    {task.priority_level || "LOW"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#919191] uppercase tracking-widest">
                    Assigned To
                  </p>
                  <p className="text-sm font-mono text-[#e5e1e4]">
                    {task.assignee_name ||
                      (task.assigned_to
                        ? `ID:${task.assigned_to}`
                        : "Unassigned")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#919191] uppercase tracking-widest">
                    Created At
                  </p>
                  <p className="text-sm font-mono text-[#e5e1e4]">
                    {formatTimestamp(task.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-[#353437] bg-[#131315] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Title
              </p>
              <p className="mt-1 text-sm font-semibold text-[#e5e1e4]">
                {task.title}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-[#919191]">
                Description
              </p>
              <p className="mt-1 text-sm text-[#e5e1e4]">
                {task.description || "No description"}
              </p>
            </div>

            <div className="border border-[#353437] bg-[#131315] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Payload Preview
              </p>
              <pre className="mt-2 text-xs font-mono text-[#e5e1e4] overflow-auto">
                {JSON.stringify(task, null, 2)}
              </pre>
            </div>

            <div className="border border-[#353437] bg-[#131315] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Task Audit Log
              </p>

              {isAuditLoading && (
                <p className="mt-2 text-sm text-[#919191]">
                  Loading task audit timeline...
                </p>
              )}

              {auditError && (
                <p className="mt-2 text-sm text-red-400">
                  Failed to load task audit log.
                </p>
              )}

              {!isAuditLoading && !auditError && auditLogs.length === 0 && (
                <p className="mt-2 text-sm text-[#919191]">
                  No audit records found for this task.
                </p>
              )}

              {!isAuditLoading && !auditError && auditLogs.length > 0 && (
                <>
                  <ul className="mt-3 space-y-2">
                    {auditLogs.map((log) => (
                      <li
                        key={log.id}
                        className="border border-[#353437] bg-[#1f1f21] p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                            {log.action}
                          </p>
                          <p className="text-[10px] font-mono text-[#919191]">
                            {formatTimestamp(log.logged_at)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs font-mono text-[#e5e1e4]">
                          Operator:{" "}
                          {log.operator_name ||
                            (log.operator_id
                              ? `ID:${log.operator_id}`
                              : "Unknown")}
                        </p>
                        <p className="mt-1 text-xs text-[#e5e1e4]">
                          {log.details || log.resource}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {hasMoreAuditLogs && (
                    <button
                      type="button"
                      onClick={() =>
                        setAuditLimit((previous) => previous + AUDIT_PAGE_SIZE)
                      }
                      className="mt-3 border border-[#353437] bg-[#1f1f21] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#e5e1e4]"
                    >
                      Load More Audit Logs
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="border border-[#353437] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
              >
                Back
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/patch-task/${task.id}`)}
                  className="bg-[#4edea3] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black font-bold disabled:opacity-50"
                >
                  Go To PATCH /tasks/:id
                </button>
                {operatorRole === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => navigate(`/delete-task/${task.id}`)}
                    className="bg-[#93000a] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white font-bold disabled:opacity-50"
                  >
                    Admin DELETE /tasks/:id
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
