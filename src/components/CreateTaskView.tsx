import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import {
  createTaskSchema,
  type CreateTaskFormInputs,
  priorityValues,
} from "../schemas/createTaskSchema";

export default function CreateTaskView() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormInputs>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      assignedTo: "",
    },
  });

  const createMissionMutation = useMutation({
    mutationFn: async (formData: CreateTaskFormInputs) => {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority_level: formData.priority,
        ...(formData.assignedTo?.trim()
          ? { assigned_to: Number(formData.assignedTo) }
          : {}),
      };

      return apiClient.post("/tasks", payload);
    },
    onSuccess: () => {
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: CreateTaskFormInputs) => {
    createMissionMutation.mutate(data);
  };

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <section className="mx-auto max-w-3xl border border-[#353437] bg-[#1f1f21] p-6">
        <header className="mb-6 border-b border-[#353437] pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
            Create Endpoint
          </p>
          <h1 className="mt-2 text-lg font-bold uppercase tracking-widest">
            POST /tasks
          </h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
              Title
            </label>
            <input
              {...register("title")}
              placeholder="Database migration verification"
              className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
            />
            {errors.title && (
              <p className="mt-1 text-xs font-mono text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Short description for backend API demonstration"
              className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
              >
                {priorityValues.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs font-mono text-red-400">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                assigned_to (User ID)
              </label>
              <input
                {...register("assignedTo")}
                placeholder="Optional: 12"
                className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm font-mono"
              />
              {errors.assignedTo && (
                <p className="mt-1 text-xs font-mono text-red-400">
                  {errors.assignedTo.message}
                </p>
              )}
            </div>
          </div>

          {createMissionMutation.isError && (
            <p className="border border-[#93000a] bg-[#93000a] px-3 py-2 text-xs font-mono text-white">
              POST /tasks failed. Confirm backend permissions and payload.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="border border-[#353437] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMissionMutation.isPending}
              className="bg-[#4edea3] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black font-bold disabled:opacity-50"
            >
              {createMissionMutation.isPending ? "Posting" : "Run POST /tasks"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
