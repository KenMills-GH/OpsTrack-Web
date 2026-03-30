import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";

const rankValues = [
  "PVT",
  "PV2",
  "PFC",
  "SPC",
  "CPL",
  "SGT",
  "SSG",
  "SFC",
  "MSG",
  "1SG",
  "SGM",
  "CSM",
  "SMA",
  "WO1",
  "CW2",
  "CW3",
  "CW4",
  "CW5",
  "2LT",
  "1LT",
  "CPT",
  "MAJ",
  "LTC",
  "COL",
  "BG",
  "MG",
  "LTG",
  "GEN",
] as const;

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rank: z.enum(rankValues),
});

type CreateUserFormInputs = z.infer<typeof createUserSchema>;

export default function CreateUserView() {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormInputs>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rank: "CPT",
    },
  });

  const onSubmit = async (data: CreateUserFormInputs) => {
    setServerMessage(null);
    setServerError(null);

    try {
      await apiClient.post("/users", data);
      setServerMessage("POST /users succeeded. Operator created.");
    } catch (caughtError: unknown) {
      const err = caughtError as {
        response?: { data?: { message?: string } };
      };

      setServerError(
        err.response?.data?.message ||
          "POST /users failed. Commander token (CPT+, TOP SECRET) may be required.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-[#353437] bg-[#1f1f21] p-8">
        <header className="mb-8 border-b border-[#353437] pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#4edea3]">
            USER CREATE TEST
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight uppercase">
            POST /users
          </h1>
          <p className="mt-2 text-xs text-[#919191] uppercase tracking-widest">
            Requires Commander Authorization
          </p>
        </header>

        {serverMessage && (
          <p className="mb-4 border border-[#4edea3] bg-[#131315] px-3 py-2 text-xs font-mono text-[#4edea3]">
            {serverMessage}
          </p>
        )}

        {serverError && (
          <p className="mb-4 border border-[#93000a] bg-[#93000a] px-3 py-2 text-xs font-mono text-white">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
                name
              </label>
              <input
                {...register("name")}
                placeholder="Kenneth Mills"
                className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-xs font-mono text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
                email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="new.operator@opstrack.mil"
                className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm font-mono"
              />
              {errors.email && (
                <p className="mt-1 text-xs font-mono text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
                password
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="********"
                className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm font-mono"
              />
              {errors.password && (
                <p className="mt-1 text-xs font-mono text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
                rank
              </label>
              <select
                {...register("rank")}
                className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm"
              >
                {rankValues.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
                clearance_level
              </p>
              <p className="text-[#4edea3] font-mono px-3 py-3 text-sm bg-[#131315] border border-[#353437]">
                UNCLASSIFIED
              </p>
              <p className="mt-2 text-xs text-[#919191]">
                Admins use PATCH to upgrade clearance
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="border border-[#353437] bg-[#131315] px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
            >
              Back To Login
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4edea3] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Posting" : "Run POST /users"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
