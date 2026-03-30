import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axios";

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority_level?: string;
  assigned_to?: number | null;
}

interface User {
  id: number;
  name: string;
}

const normalizePatchStatus = (value?: string) => {
  const normalized = (value || "PENDING").toUpperCase();
  if (normalized === "IN_PROGRESS") return "PENDING";
  return normalized;
};

export default function PatchTaskView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("PENDING");
  const [priority, setPriority] = useState("LOW");
  const [assignedTo, setAssignedTo] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks");
      if (Array.isArray(response.data)) return response.data as Task[];
      if (Array.isArray(response.data.tasks))
        return response.data.tasks as Task[];
      if (Array.isArray(response.data.data))
        return response.data.data as Task[];
      return [] as Task[];
    },
  });

  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get("/users", {
        params: {
          limit: 100,
          offset: 0,
        },
      });

      if (Array.isArray(response.data)) return response.data as User[];
      if (Array.isArray(response.data.users))
        return response.data.users as User[];
      if (Array.isArray(response.data.data))
        return response.data.data as User[];
      return [] as User[];
    },
  });

  const task = (tasks || []).find((entry) => String(entry.id) === id);

  useEffect(() => {
    if (!task) return;
    setStatus(normalizePatchStatus(task.status));
    setPriority((task.priority_level || "LOW").toUpperCase());
    setAssignedTo(task.assigned_to ? String(task.assigned_to) : "");
  }, [task]);

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const payload = {
        status,
        priority_level: priority,
        ...(assignedTo.trim() ? { assigned_to: Number(assignedTo) } : {}),
      };
      return apiClient.patch(`/tasks/${id}`, payload);
    },
    onSuccess: async () => {
      setMessage("PATCH /tasks/:id succeeded.");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (caughtError) => {
      const axiosError = caughtError as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message || "PATCH /tasks/:id failed.",
      );
    },
  });

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <section className="mx-auto max-w-3xl border border-[#353437] bg-[#1f1f21] p-6">
        <header className="mb-6 border-b border-[#353437] pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
            Update Endpoint
          </p>
          <h1 className="mt-2 text-lg font-bold uppercase tracking-widest">
            PATCH /tasks/{id}
          </h1>
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
                Task
              </p>
              <p className="mt-1 text-sm font-semibold">
                #{task.id} {task.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  priority_level
                </label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  assigned_to
                </label>
                <select
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  disabled={isUsersLoading || Boolean(usersError)}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
                >
                  <option value="">Unassigned</option>
                  {(users || []).map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {usersError && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    Failed to load roster.
                  </p>
                )}
              </div>
            </div>

            {message && (
              <p className="border border-[#353437] bg-[#131315] px-3 py-2 text-xs font-mono text-[#e5e1e4]">
                {message}
              </p>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="border border-[#353437] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => patchMutation.mutate()}
                disabled={patchMutation.isPending}
                className="bg-[#4edea3] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black font-bold disabled:opacity-50"
              >
                {patchMutation.isPending ? "Patching" : "Run PATCH /tasks/:id"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
