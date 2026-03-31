import { AxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.code === "ECONNABORTED") {
    return "Request timed out. Check backend availability.";
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  return fallback;
}
