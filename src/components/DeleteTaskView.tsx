import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../api/axios";
import { getApiErrorMessage } from "../utils/apiError";
import { QUERY_KEYS } from "../constants/queryKeys";

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority_level?: string;
  assigned_to?: number | null;
}

export default function DeleteTaskView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

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
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(id) });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      navigate("/dashboard");
    },
    onError: (caughtError) => {
      setMessage(getApiErrorMessage(caughtError, "DELETE /tasks/:id failed."));
    },
  });

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <section className="mx-auto max-w-3xl border border-[#353437] bg-[#1f1f21] p-6">
        <header className="mb-6 border-b border-[#353437] pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
            Admin Delete Endpoint
          </p>
          <h1 className="mt-2 text-lg font-bold uppercase tracking-widest">
            DELETE /tasks/{id}
          </h1>
          <p className="mt-2 text-xs text-[#919191] uppercase tracking-widest">
            Admin-only destructive action
          </p>
        </header>

        {isLoading && <p className="text-sm text-[#919191]">Loading task...</p>}
        {error && <p className="text-sm text-red-400">Failed to load task.</p>}
        {!isLoading && !error && !task && (
          <p className="text-sm text-[#919191]">Task not found.</p>
        )}

        {task && (
          <div className="space-y-4">
            <div className="border border-[#93000a] bg-[#131315] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Task To Delete
              </p>
              <p className="mt-1 text-sm font-semibold">
                #{task.id} {task.title}
              </p>
              <p className="mt-2 text-xs text-[#919191]">
                {task.description || "No description"}
              </p>
            </div>

            <p className="text-xs text-[#919191] uppercase tracking-widest">
              This admin request is destructive and cannot be undone.
            </p>

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
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-[#93000a] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white font-bold disabled:opacity-50"
              >
                {deleteMutation.isPending
                  ? "Deleting"
                  : "Run Admin DELETE /tasks/:id"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
