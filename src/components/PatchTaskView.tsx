import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "../api/axios";
import {
  patchTaskSchema,
  patchTaskPriorityValues,
  patchTaskStatusValues,
  type PatchTaskFormInputs,
} from "../schemas/patchTaskSchema";
import { getApiErrorMessage } from "../utils/apiError";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parseCollectionResponse } from "../api/responseParsers";

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
  if (normalized === "ACTIVE" || normalized === "PENDING" || normalized === "RESOLVED") {
    return normalized;
  }
  return "PENDING";
};

export default function PatchTaskView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatchTaskFormInputs>({
    resolver: zodResolver(patchTaskSchema),
    defaultValues: {
      status: "PENDING",
      priority_level: "LOW",
      assigned_to: "",
    },
  });

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

  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: async () => {
      const response = await apiClient.get("/users", {
        params: {
          limit: 100,
          offset: 0,
        },
      });

      return parseCollectionResponse<User>(response.data);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!task) return;
    reset({
      status: normalizePatchStatus(
        task.status,
      ) as PatchTaskFormInputs["status"],
      priority_level: (
        task.priority_level || "LOW"
      ).toUpperCase() as PatchTaskFormInputs["priority_level"],
      assigned_to: task.assigned_to ? String(task.assigned_to) : "",
    });
  }, [task, reset]);

  const patchMutation = useMutation({
    mutationFn: async (values: PatchTaskFormInputs) => {
      if (!id) return;
      const payload = {
        status: values.status,
        priority_level: values.priority_level,
        ...(values.assigned_to?.trim()
          ? { assigned_to: Number(values.assigned_to) }
          : {}),
      };
      return apiClient.patch(`/tasks/${id}`, payload);
    },
    onSuccess: async () => {
      setMessage("PATCH /tasks/:id succeeded.");
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(id) });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
    onError: (caughtError) => {
      setMessage(getApiErrorMessage(caughtError, "PATCH /tasks/:id failed."));
    },
  });

  const onSubmit = (values: PatchTaskFormInputs) => {
    patchMutation.mutate(values);
  };

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
        {error && <p className="text-sm text-red-400">Failed to load task.</p>}
        {!isLoading && !error && !task && (
          <p className="text-sm text-[#919191]">Task not found.</p>
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

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  status
                </label>
                <select
                  {...register("status")}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
                >
                  {patchTaskStatusValues.map((statusValue) => (
                    <option key={statusValue} value={statusValue}>
                      {statusValue}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  priority_level
                </label>
                <select
                  {...register("priority_level")}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
                >
                  {patchTaskPriorityValues.map((priorityValue) => (
                    <option key={priorityValue} value={priorityValue}>
                      {priorityValue}
                    </option>
                  ))}
                </select>
                {errors.priority_level && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.priority_level.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  assigned_to
                </label>
                <select
                  {...register("assigned_to")}
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
                    {getApiErrorMessage(usersError, "Failed to load roster.")}
                  </p>
                )}
                {errors.assigned_to && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.assigned_to.message}
                  </p>
                )}
              </div>
            </form>

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
                onClick={handleSubmit(onSubmit)}
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
