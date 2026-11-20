import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "doing", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const ProjectInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : null)),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour"),
});

export const TaskInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    ])
    .optional()
    .transform((value) => (value ? value : null)),
});

export type ProjectInput = z.infer<typeof ProjectInput>;
export type TaskInput = z.infer<typeof TaskInput>;
