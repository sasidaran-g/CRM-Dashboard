import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .regex(/^[+]?[0-9()\-.\s]{7,20}$/, "Enter a valid phone number"),
  company: z.string().trim(),
  status: z.enum(["Active", "Inactive"]),
  lastContactDate: z.string().min(1, "Last contact date is required"),
  notes: z.string(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
