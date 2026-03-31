import { z } from "zod";

export const militaryRankValues = [
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

export const clearanceValues = [
  "UNCLASSIFIED",
  "CONFIDENTIAL",
  "SECRET",
  "TOP SECRET",
] as const;

export const patchUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  rank: z.enum(militaryRankValues),
  clearance_level: z.enum(clearanceValues),
  is_active: z.boolean(),
});

export type PatchUserFormInputs = z.infer<typeof patchUserSchema>;
