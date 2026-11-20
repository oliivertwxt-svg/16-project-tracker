import "server-only";
import { z } from "zod";
import { sql } from "./db";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
}

export interface ProjectWithProgress extends Project {
  totalTasks: number;
  doneTasks: number;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
}

const projectRowSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  created_at: z.union([z.string(), z.date()]).transform(String),
});

const projectProgressRowSchema = projectRowSchema.extend({
  total_tasks: z.coerce.number(),
  done_tasks: z.coerce.number(),
});

const taskRowSchema = z.object({
  id: z.coerce.number(),
  project_id: z.coerce.number(),
  title: z.string(),
  status: z.enum(["todo", "doing", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z
    .union([z.string(), z.date()])
    .nullable()
    .transform((value) => (value ? String(value) : null)),
  created_at: z.union([z.string(), z.date()]).transform(String),
});

export async function getProjects(): Promise<ProjectWithProgress[]> {
  const rows = await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at,
      COUNT(t.id) AS total_tasks,
      COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_tasks
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    GROUP BY p.id, p.name, p.description, p.color, p.created_at
    ORDER BY p.created_at DESC
  `;

  return rows.map((row) => {
    const parsed = projectProgressRowSchema.parse(row);
    return {
      id: parsed.id,
      name: parsed.name,
      description: parsed.description,
      color: parsed.color,
      createdAt: parsed.created_at,
      totalTasks: parsed.total_tasks,
      doneTasks: parsed.done_tasks,
    };
  });
}

export async function getProject(id: number): Promise<Project | null> {
  const rows = await sql`
    SELECT id, name, description, color, created_at
    FROM projects
    WHERE id = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  const parsed = projectRowSchema.parse(rows[0]);
  return {
    id: parsed.id,
    name: parsed.name,
    description: parsed.description,
    color: parsed.color,
    createdAt: parsed.created_at,
  };
}

export async function getTasks(
  projectId: number,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const status = filters.status ?? null;
  const priority = filters.priority ?? null;
  const searchPattern = filters.q ? `%${filters.q}%` : null;
  const rows = await sql`
    SELECT
      id,
      project_id,
      title,
      status,
      priority,
      due_date::text AS due_date,
      created_at
    FROM tasks
    WHERE project_id = ${projectId}
      AND (${status}::text IS NULL OR status = ${status})
      AND (${priority}::text IS NULL OR priority = ${priority})
      AND (${searchPattern}::text IS NULL OR title ILIKE ${searchPattern})
    ORDER BY created_at DESC
  `;

  return rows.map((row) => {
    const parsed = taskRowSchema.parse(row);
    return {
      id: parsed.id,
      projectId: parsed.project_id,
      title: parsed.title,
      status: parsed.status,
      priority: parsed.priority,
      dueDate: parsed.due_date,
      createdAt: parsed.created_at,
    };
  });
}
