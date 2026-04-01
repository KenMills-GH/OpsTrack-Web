import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axios";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface TaskListResponse {
  data: Task[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
  };
}

const PAGE_SIZE = 10;

const SORT_FIELDS = [
  "all",
  "status",
  "priority",
  "newest",
  "title",
  "assignee",
] as const;

type SortField = (typeof SORT_FIELDS)[number];
type SortDirection = "asc" | "desc";

const getPriorityClass = (priority?: string) => {
  const normalized = (priority || "LOW").toUpperCase();
  if (normalized === "CRITICAL") return "bg-[#93000a] text-white";
  if (normalized === "HIGH") return "bg-[#f59e0b] text-black";
  if (normalized === "MEDIUM") return "bg-[#4edea3] text-black";
  return "bg-[#353437] text-[#e5e1e4]";
};

// Maps frontend sort labels to API sort field names
const SORT_FIELD_MAP: Record<SortField, string> = {
  all: "id",
  newest: "id",
  status: "status",
  priority: "priority",
  title: "title",
  assignee: "assignee",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<SortField>("all");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // "newest" sorts by ID but the UI label treats "asc" as newest-first (descending ID)
  const apiSort = SORT_FIELD_MAP[sortField];
  const apiDirection =
    sortField === "newest"
      ? sortDirection === "asc"
        ? "desc"
        : "asc"
      : sortDirection;

  const {
    data: taskResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.tasksDashboard(currentPage, sortField, sortDirection),
    queryFn: async () => {
      const response = await apiClient.get("/tasks", {
        params: {
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          sort: apiSort,
          direction: apiDirection,
        },
      });

      return parsePaginatedResponse<Task>(
        response.data,
        PAGE_SIZE,
        (currentPage - 1) * PAGE_SIZE,
      ) as TaskListResponse;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const tasks = taskResponse?.data || [];
  const paginationMeta = taskResponse?.meta;

  const taskRows = useMemo(() => {
    const rawTasks = Array.isArray(tasks) ? tasks : [];

    return rawTasks.filter((task: Task) => {
      const rawSearch = `${task.id} ${task.title || ""} ${task.description || ""}`;
      const matchesSearch = rawSearch
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());

      return matchesSearch;
    });
  }, [searchText, tasks]);

  const summary = useMemo(() => {
    const rawTasks = Array.isArray(tasks) ? tasks : [];

    return rawTasks.reduce(
      (acc, task: Task) => {
        const status = normalizeTaskStatusForUi(task.status);

        if (status === "PENDING") acc.pending += 1;
        if (status === "ACTIVE") acc.active += 1;
        if (status === "RESOLVED") acc.resolved += 1;

        return acc;
      },
      { pending: 0, active: 0, resolved: 0 },
    );
  }, [tasks]);

  const totalRows = paginationMeta?.total ?? tasks.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  // Sorting is handled server-side; taskRows is already in the correct order
  const sortedRows = taskRows;

  return (
    <main className="flex-1 overflow-auto bg-[#1f1f21] p-4 md:p-6">
      <section className="min-h-full border border-[#353437] bg-[#1f1f21] p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
              Task Endpoint
            </p>
            <h1 className="text-lg font-bold uppercase tracking-widest">
              GET /tasks
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/create-task")}
            className="bg-[#4edea3] px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black"
          >
            Go To POST /tasks
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="border border-[#353437] bg-[#131315] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Pending
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">
              {summary.pending}
            </p>
          </div>
          <div className="border border-[#353437] bg-[#131315] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Active
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">{summary.active}</p>
          </div>
          <div className="border border-[#353437] bg-[#131315] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Resolved
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">
              {summary.resolved}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={sortField}
            onChange={(event) => {
              setSortField(event.target.value as SortField);
              setCurrentPage(1);
            }}
            className="border border-[#353437] bg-[#131315] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#e5e1e4]"
          >
            <option value="all">Sort: All</option>
            <option value="status">Sort: Status</option>
            <option value="priority">Sort: Priority</option>
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title</option>
            <option value="assignee">Sort: Assigned</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSortDirection((previous) =>
                previous === "asc" ? "desc" : "asc",
              );
              setCurrentPage(1);
            }}
            className="border border-[#353437] bg-[#131315] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#e5e1e4]"
          >
            {sortDirection === "asc" ? "Asc" : "Desc"}
          </button>

          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search title or description"
            className="min-w-64 flex-1 border border-[#353437] bg-[#131315] px-3 py-2 text-xs font-mono"
          />

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-[#353437] bg-[#131315] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#e5e1e4]"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="border border-[#93000a] bg-[#93000a] px-3 py-2 text-xs font-mono text-white">
            Failed to fetch tasks.
          </p>
        )}

        <div className="border border-[#353437] bg-[#131315] max-h-[56vh] overflow-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#353437] text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                <th className="px-3 py-2 font-normal">ID</th>
                <th className="px-3 py-2 font-normal">Title</th>
                <th className="px-3 py-2 font-normal">Priority</th>
                <th className="px-3 py-2 font-normal">Status</th>
                <th className="px-3 py-2 font-normal">Assigned To</th>
                <th className="px-3 py-2 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-3 py-4 text-sm text-[#919191]" colSpan={6}>
                    Running GET /tasks...
                  </td>
                </tr>
              )}

              {!isLoading && sortedRows.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-[#919191]" colSpan={6}>
                    API returned zero task records.
                  </td>
                </tr>
              )}

              {!isLoading &&
                sortedRows.map((task: Task) => (
                  <tr
                    key={task.id}
                    className="border-b border-[#2a2a2c] text-sm"
                  >
                    <td className="px-3 py-3 font-mono">{task.id}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-xs text-[#919191] mt-1 line-clamp-1">
                        {task.description || "No description"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest ${getPriorityClass(task.priority_level)}`}
                      >
                        {task.priority_level || "LOW"}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {normalizeTaskStatusForUi(task.status)}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#919191]">
                      {task.assignee_name ||
                        (task.assigned_to
                          ? `ID:${task.assigned_to}`
                          : "Unassigned")}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/mission/${task.id}`, {
                              state: { task },
                            })
                          }
                          className="border border-[#353437] px-2 py-1 text-[10px] uppercase tracking-widest"
                        >
                          DETAIL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border border-[#353437] bg-[#131315] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
          <p>
            Page {currentPage} of {totalPages} | Total Tasks: {totalRows}
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
