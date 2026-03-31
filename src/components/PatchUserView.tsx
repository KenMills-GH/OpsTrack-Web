import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "../api/axios";
import {
  patchUserSchema,
  militaryRankValues,
  clearanceValues,
  type PatchUserFormInputs,
} from "../schemas/patchUserSchema";
import { getApiErrorMessage } from "../utils/apiError";
import { QUERY_KEYS } from "../constants/queryKeys";

interface Operator {
  id: number;
  name: string;
  rank: string;
  clearance_level: string;
  email: string;
  is_active: boolean;
}

export default function PatchUserView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PatchUserFormInputs>({
    resolver: zodResolver(patchUserSchema),
    defaultValues: {
      name: "",
      email: "",
      rank: "CPT",
      clearance_level: "UNCLASSIFIED",
      is_active: true,
    },
  });

  const {
    data: operator,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.user(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data as Operator;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!operator) return;
    reset({
      name: operator.name,
      email: operator.email,
      rank: operator.rank as PatchUserFormInputs["rank"],
      clearance_level:
        operator.clearance_level as PatchUserFormInputs["clearance_level"],
      is_active: operator.is_active,
    });
  }, [operator, reset]);

  const patchMutation = useMutation({
    mutationFn: async (values: PatchUserFormInputs) => {
      if (!id) return;
      return apiClient.patch(`/users/${id}`, {
        name: values.name.trim(),
        email: values.email.trim(),
        rank: values.rank,
        clearance_level: values.clearance_level,
        is_active: values.is_active,
      });
    },
    onSuccess: async () => {
      setMessage("PATCH /users/:id succeeded.");
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
    },
    onError: (caughtError) => {
      setMessage(getApiErrorMessage(caughtError, "PATCH /users/:id failed."));
    },
  });

  const onSubmit = (values: PatchUserFormInputs) => {
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
            PATCH /users/{id}
          </h1>
        </header>

        {isLoading && (
          <p className="text-sm text-[#919191]">Loading operator...</p>
        )}

        {error && (
          <p className="text-sm text-red-400">Failed to load operator.</p>
        )}

        {!isLoading && !error && !operator && (
          <div className="space-y-4">
            <p className="text-sm text-[#919191]">Operator not found.</p>
            <button
              type="button"
              onClick={() => navigate("/operator-roster")}
              className="border border-[#353437] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
            >
              Back to Roster
            </button>
          </div>
        )}

        {operator && (
          <div className="space-y-4">
            <div className="border border-[#353437] bg-[#131315] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Operator
              </p>
              <p className="mt-1 text-sm font-semibold">
                #{operator.id} — {operator.rank} {operator.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm text-[#e5e1e4]"
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm text-[#e5e1e4]"
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  rank
                </label>
                <select
                  {...register("rank")}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm text-[#e5e1e4]"
                >
                  {militaryRankValues.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.rank && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.rank.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  clearance_level
                </label>
                <select
                  {...register("clearance_level")}
                  className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm text-[#e5e1e4]"
                >
                  {clearanceValues.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.clearance_level && (
                  <p className="mt-1 text-xs font-mono text-red-400">
                    {errors.clearance_level.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border border-[#353437] bg-[#131315] px-4 py-3">
              <input
                id="is_active"
                type="checkbox"
                {...register("is_active")}
                className="w-4 h-4 accent-[#4edea3]"
              />
              <label
                htmlFor="is_active"
                className="text-[10px] uppercase tracking-[0.2em] text-[#919191]"
              >
                is_active
              </label>
              <span className="font-mono text-xs text-[#e5e1e4]">
                {watch("is_active") ? "TRUE" : "FALSE"}
              </span>
            </div>

            {message && (
              <p className="border border-[#353437] bg-[#131315] px-3 py-2 text-xs font-mono text-[#e5e1e4]">
                {message}
              </p>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/operator-roster")}
                className="border border-[#353437] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={patchMutation.isPending}
                className="border border-[#4edea3] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#4edea3] font-bold disabled:opacity-50"
              >
                {patchMutation.isPending
                  ? "Updating..."
                  : "Run PATCH /users/:id"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
