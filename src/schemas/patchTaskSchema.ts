import { z } from "zod";

export const patchTaskStatusValues = [
  "PENDING",
  "ACTIVE",
  "RESOLVED",
] as const;
export const patchTaskPriorityValues = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const patchTaskSchema = z.object({
  status: z.enum(patchTaskStatusValues, { error: "Status must be PENDING, ACTIVE, or RESOLVED" }),
  priority_level: z.enum(patchTaskPriorityValues),
  assigned_to: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || value.trim() === "") return true;
      return Number.isInteger(Number(value)) && Number(value) > 0;
    }, "assigned_to must be a positive number"),
});

export type PatchTaskFormInputs = z.infer<typeof patchTaskSchema>;
