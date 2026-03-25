import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import apiClient from "../api/axios.ts";
import { useNavigate } from "react-router-dom";

// 1. The Frontend Zod Perimeter
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Extract TypeScript types directly from the Zod schema
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 2. Initialize React Hook Form with Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // 3. The Submit Handler (Broadcasting to Port 5000)
  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      // Send the payload to Headquarters
      const response = await apiClient.post("/auth/login", data);

      // If successful, grab the security token and store it in the browser
      const token = response.data.token;
      localStorage.setItem("token", token);

      navigate("/dashboard");
      // (Later, we will redirect the user to the Mission Board here)
    } catch (error: any) {
      // Handle the 401 Unauthorized or 429 Too Many Requests errors
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Network failure. Could not reach Headquarters.");
      }
    }
  };

  // 4. The UI (Tailwind Dark Mode)
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100 tracking-wider">
            OPSTRACK
          </h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
            Tactical Network Login
          </p>
        </div>

        {serverError && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              OPERATOR EMAIL
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full bg-slate-900 text-slate-100 border border-slate-600 rounded p-3 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="s.connor@opstrack.mil"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              SECURITY CLEARANCE (PASSWORD)
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-slate-900 text-slate-100 border border-slate-600 rounded p-3 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "AUTHENTICATING..." : "INITIATE LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
