import { z } from "zod";

export const priorityValues = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(priorityValues, {
    error: "Select a priority level",
  }),
  assignedTo: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === "") return true;
      return Number.isInteger(Number(value)) && Number(value) > 0;
    }, "Assigned To must be a positive number"),
});

export type CreateTaskFormInputs = z.infer<typeof createTaskSchema>;
