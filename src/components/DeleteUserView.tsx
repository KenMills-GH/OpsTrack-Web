import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../api/axios";
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

export default function DeleteUserView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return apiClient.delete(`/users/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
      navigate("/operator-roster");
    },
    onError: (caughtError) => {
      setMessage(getApiErrorMessage(caughtError, "DELETE /users/:id failed."));
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
            DELETE /users/{id}
          </h1>
          <p className="mt-2 text-xs text-[#919191] uppercase tracking-widest">
            Admin-only deactivation action
          </p>
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
            <div className="border border-[#93000a] bg-[#131315] p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                Operator To Deactivate
              </p>
              <p className="text-sm font-semibold text-[#e5e1e4]">
                #{operator.id} — {operator.rank} {operator.name}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                    Clearance
                  </p>
                  <p className="font-mono text-xs text-[#e5e1e4]">
                    {operator.clearance_level}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                    Email
                  </p>
                  <p className="font-mono text-xs text-[#919191]">
                    {operator.email}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#919191]">
                    Status
                  </p>
                  <p
                    className={`font-mono text-xs ${operator.is_active ? "text-[#4edea3]" : "text-[#93000a]"}`}
                  >
                    {operator.is_active ? "ACTIVE" : "INACTIVE"}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#919191] uppercase tracking-widest">
              This request deactivates the account and preserves audit history.
            </p>

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
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-[#93000a] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white font-bold disabled:opacity-50"
              >
                {deleteMutation.isPending
                  ? "Deactivating..."
                  : "Run Admin DELETE /users/:id"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
