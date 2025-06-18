import { z } from "zod";

export const businessCardSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedin: z.string().url("Invalid URL").or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
});

export type BusinessCardFormData = z.infer<typeof businessCardSchema>;
