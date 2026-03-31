import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parsePaginatedResponse } from "../api/responseParsers";
import { getApiErrorMessage } from "../utils/apiError";

interface Operator {
  id: number;
  name: string;
  rank: string;
  clearance_level: string;
  email: string;
  is_active: boolean;
}

interface OperatorResponse {
  data: Operator[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
  };
}

const PAGE_SIZE = 20;

export default function OperatorRosterView() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: rosterResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<OperatorResponse>({
    queryKey: QUERY_KEYS.usersPage(currentPage),
    queryFn: async () => {
      const response = await apiClient.get("/users", {
        params: {
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
        },
      });
      return parsePaginatedResponse<Operator>(
        response.data,
        PAGE_SIZE,
        (currentPage - 1) * PAGE_SIZE,
      ) as OperatorResponse;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const operators = rosterResponse?.data || [];
  const meta = rosterResponse?.meta;
  const total = meta?.total ?? operators.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex-1 overflow-hidden p-4 md:p-6">
      <section className="h-full border border-[#353437] bg-[#1f1f21] p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
              Admin Endpoint
            </p>
            <h1 className="text-lg font-bold uppercase tracking-widest">
              GET /users
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
              Total Operators
            </p>
            <p className="text-lg font-mono text-[#e5e1e4]">{total}</p>
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
            {getApiErrorMessage(error, "Failed to load operator roster.")}
          </p>
        )}

        <div className="border border-[#353437] bg-[#131315] flex-1 overflow-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#353437] text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                <th className="px-3 py-2 font-normal">ID</th>
                <th className="px-3 py-2 font-normal">Name</th>
                <th className="px-3 py-2 font-normal">Rank</th>
                <th className="px-3 py-2 font-normal">Clearance</th>
                <th className="px-3 py-2 font-normal">Email</th>
                <th className="px-3 py-2 font-normal">Active</th>
                <th className="px-3 py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-3 py-4 text-sm text-[#919191]" colSpan={7}>
                    Loading operator roster...
                  </td>
                </tr>
              )}

              {!isLoading && !error && operators.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-[#919191]" colSpan={7}>
                    No operators on record.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                operators.map((op) => (
                  <tr
                    key={op.id}
                    className="border-b border-[#2a2a2c] text-sm align-middle"
                  >
                    <td className="px-3 py-3 font-mono text-xs text-[#919191]">
                      #{op.id}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#e5e1e4]">
                      {op.name}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#e5e1e4]">
                      {op.rank}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#919191]">
                      {op.clearance_level}
                    </td>
                    <td className="px-3 py-3 text-xs text-[#919191]">
                      {op.email}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      <span
                        className={
                          op.is_active ? "text-[#4edea3]" : "text-[#93000a]"
                        }
                      >
                        {op.is_active ? "YES" : "NO"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/patch-user/${op.id}`)}
                          className="border border-[#353437] bg-[#353437] px-2 py-1 text-[10px] uppercase tracking-widest text-[#e5e1e4]"
                        >
                          PATCH
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/delete-user/${op.id}`)}
                          className="border border-[#93000a] bg-[#93000a] px-2 py-1 text-[10px] uppercase tracking-widest text-white"
                        >
                          DELETE
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
            Page {currentPage} of {totalPages} | Total Operators: {total}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isFetching}
              className="border border-[#353437] px-3 py-1 text-[#e5e1e4] disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => (meta?.has_next ? prev + 1 : prev))
              }
              disabled={!meta?.has_next || isFetching}
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
