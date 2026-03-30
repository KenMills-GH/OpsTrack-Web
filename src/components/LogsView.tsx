import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";
import apiClient from "../api/axios";

interface AuditLog {
  id: number;
  operator_id?: number | null;
  operator_name?: string | null;
  task_id?: number | null;
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

const LOG_PAGE_SIZE = 20;

export default function LogsView() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: auditResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["all-audit-logs", currentPage],
    queryFn: async () => {
      const response = await apiClient.get("/tasks/audit-logs", {
        params: {
          limit: LOG_PAGE_SIZE,
          offset: (currentPage - 1) * LOG_PAGE_SIZE,
        },
      });

      if (Array.isArray(response.data)) {
        return {
          data: response.data as AuditLog[],
          meta: {
            total: (response.data as AuditLog[]).length,
            limit: LOG_PAGE_SIZE,
            offset: (currentPage - 1) * LOG_PAGE_SIZE,
            has_next: false,
          },
        } as AuditLogResponse;
      }

      if (Array.isArray(response.data.data)) {
        return response.data as AuditLogResponse;
      }

      return {
        data: [],
        meta: {
          total: 0,
          limit: LOG_PAGE_SIZE,
          offset: (currentPage - 1) * LOG_PAGE_SIZE,
          has_next: false,
        },
      } as AuditLogResponse;
    },
  });

  const logs = auditResponse?.data || [];
  const paginationMeta = auditResponse?.meta;
  const totalLogs = paginationMeta?.total ?? logs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / LOG_PAGE_SIZE));
  const axiosError = error as AxiosError<{ message?: string }> | null;

  const formatTimestamp = (value?: string) => {
    if (!value) return "Unavailable";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Unavailable";
    return parsed.toLocaleString();
  };

  return (
    <main className="flex-1 overflow-hidden p-4 md:p-6">
      <section className="h-full border border-[#353437] bg-[#1f1f21] p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
              Audit Endpoint
            </p>
            <h1 className="text-lg font-bold uppercase tracking-widest">
              GET /tasks/audit-logs
            </h1>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-[#353437] bg-[#131315] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#e5e1e4]"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="border border-[#353437] bg-[#131315] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Total Logs
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">{totalLogs}</p>
          </div>
          <div className="border border-[#353437] bg-[#131315] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Current Page
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">{currentPage}</p>
          </div>
          <div className="border border-[#353437] bg-[#131315] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Access Level
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">ADMIN</p>
          </div>
        </div>

        {error && (
          <p className="border border-[#93000a] bg-[#93000a] px-3 py-2 text-xs font-mono text-white">
            {axiosError?.response?.data?.message ||
              "Failed to load system audit log."}
          </p>
        )}

        <div className="border border-[#353437] bg-[#131315] flex-1 overflow-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#353437] text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                <th className="px-3 py-2 font-normal">Time</th>
                <th className="px-3 py-2 font-normal">Operator</th>
                <th className="px-3 py-2 font-normal">Action</th>
                <th className="px-3 py-2 font-normal">Resource</th>
                <th className="px-3 py-2 font-normal">Task</th>
                <th className="px-3 py-2 font-normal">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-3 py-4 text-sm text-[#919191]" colSpan={6}>
                    Loading full audit ledger...
                  </td>
                </tr>
              )}

              {!isLoading && !error && logs.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-[#919191]" colSpan={6}>
                    No audit records available.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#2a2a2c] text-sm align-top"
                  >
                    <td className="px-3 py-3 font-mono text-xs text-[#919191]">
                      {formatTimestamp(log.logged_at)}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {log.operator_name ||
                        (log.operator_id ? `ID:${log.operator_id}` : "Unknown")}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#e5e1e4]">
                      {log.action}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#e5e1e4]">
                      {log.resource}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#919191]">
                      {log.task_id ? `#${log.task_id}` : "N/A"}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#919191]">
                      {log.details || "No detail payload"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border border-[#353437] bg-[#131315] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
          <p>
            Page {currentPage} of {totalPages} | Total Logs: {totalLogs}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isFetching}
              className="border border-[#353437] px-3 py-1 text-[#e5e1e4] disabled:opacity-40"
            >
              First
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) => Math.max(1, previous - 1))
              }
              disabled={currentPage === 1 || isFetching}
              className="border border-[#353437] px-3 py-1 text-[#e5e1e4] disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((previous) =>
                  paginationMeta?.has_next ? previous + 1 : previous,
                )
              }
              disabled={!paginationMeta?.has_next || isFetching}
              className="border border-[#353437] px-3 py-1 text-[#e5e1e4] disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isFetching}
              className="border border-[#353437] px-3 py-1 text-[#e5e1e4] disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
