import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import { getApiErrorMessage } from "../utils/apiError";

const loginSchema = z.object({
  email: z.string().email("Invalid operator email format"),
  password: z.string().min(6, "Access Key must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);

    try {
      const response = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (caughtError: unknown) {
      setServerError(
        getApiErrorMessage(
          caughtError,
          "Authentication failed. Check credentials.",
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#353437] bg-[#1f1f21] p-8">
        <header className="mb-8 border-b border-[#353437] pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#4edea3]">
            AUTH TEST
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight uppercase">
            POST /auth/login
          </h1>
          <p className="mt-2 text-xs text-[#919191] uppercase tracking-widest">
            Saves JWT To localStorage
          </p>
        </header>

        {serverError && (
          <p className="mb-4 border border-[#93000a] bg-[#93000a] px-3 py-2 text-xs font-mono text-white">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="operator@opstrack.core"
              className="w-full border border-[#353437] bg-[#353437] px-3 py-3 text-sm font-mono"
            />
            {errors.email && (
              <p className="mt-1 text-xs font-mono text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#919191] mb-2">
              Password
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white px-3 py-3 text-xs uppercase tracking-[0.2em] text-black font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Posting" : "Run Login Request"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/create-user")}
            className="w-full border border-[#353437] bg-[#131315] px-3 py-3 text-xs uppercase tracking-[0.2em] text-[#e5e1e4] font-bold"
          >
            Go To POST /users
          </button>
        </form>
      </div>
    </div>
  );
}
