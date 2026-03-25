import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axios";
import { useState, useEffect } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority_level: string;
}

// 1. Define the shape of our Operator data
interface Operator {
  rank: string;
  name: string;
  role: string;
}

export default function Dashboard() {
  const [operator, setOperator] = useState<Operator | null>(null);

  // 2. Read the security badge on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode the middle part of the JWT to read the JSON payload
        const payload = JSON.parse(atob(token.split(".")[1]));
        setOperator(payload);
      } catch (error) {
        console.error("Failed to decode security badge.");
      }
    }
  }, []);

  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks");

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.tasks && Array.isArray(response.data.tasks)) {
        return response.data.tasks;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-8">
      {/* 3. Updated Header: Title on the left, Operator on the right */}
      <header className="border-b border-slate-700 pb-6 mb-8 flex justify-between items-end max-w-4xl mx-auto">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-wider">
            COMMAND DASHBOARD
          </h1>
          <p className="text-emerald-400 text-sm tracking-widest mt-1">
            STATUS: SECURE CONNECTION ESTABLISHED
          </p>
        </div>

        {operator && (
          <div className="text-right border-l border-slate-700 pl-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              ACTIVE OPERATOR
            </p>
            <p className="text-lg font-bold text-slate-100 tracking-wide">
              {operator.rank} {operator.name}
            </p>
            <p className="text-xs text-emerald-500 font-mono mt-1">
              [{operator.role} ACCESS]
            </p>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-slate-800 p-6 rounded border border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-slate-300 text-center">
            ACTIVE MISSIONS (TASKS)
          </h2>

          {isLoading && (
            <div className="text-emerald-500 animate-pulse tracking-widest text-sm text-center">
              DOWNLOADING MISSION DATA...
            </div>
          )}

          {isError && (
            <div className="text-red-400 bg-red-900/20 p-4 border border-red-800 rounded text-center">
              CRITICAL ERROR: Failed to retrieve task list from Headquarters.
            </div>
          )}

          {tasks && tasks.length === 0 && (
            <p className="text-slate-400 text-center">
              No active missions on the board.
            </p>
          )}

          <div className="grid gap-4 text-left">
            {tasks &&
              tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="bg-slate-700/50 p-4 rounded border border-slate-600 flex justify-between items-center hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-bold rounded mb-2
                    ${
                      task.priority_level === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : task.priority_level === "HIGH"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-600 text-slate-200"
                    }`}
                    >
                      {task.priority_level}
                    </span>
                    <p className="text-xs text-slate-400 uppercase">
                      {task.status}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
