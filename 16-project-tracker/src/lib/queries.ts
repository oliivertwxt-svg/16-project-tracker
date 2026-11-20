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

export interface TrackerStats {
  totals: {
    projects: number;
    tasks: number;
    todo: number;
    doing: number;
    done: number;
    low: number;
    medium: number;
    high: number;
    overdue: number;
  };
  projects: {
    id: number;
    name: string;
    totalTasks: number;
    doneTasks: number;
    completionPercent: number;
  }[];
  overdueTasks: {
    id: number;
    projectId: number;
    projectName: string;
    title: string;
    priority: TaskPriority;
    dueDate: string;
  }[];
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

const totalsRowSchema = z.object({
  total_projects: z.coerce.number(),
  total_tasks: z.coerce.number(),
  todo_tasks: z.coerce.number(),
  doing_tasks: z.coerce.number(),
  done_tasks: z.coerce.number(),
  low_priority_tasks: z.coerce.number(),
  medium_priority_tasks: z.coerce.number(),
  high_priority_tasks: z.coerce.number(),
  overdue_tasks: z.coerce.number(),
});

const statsDetailRowSchema = z.discriminatedUnion("row_type", [
  z.object({
    row_type: z.literal("project"),
    project_id: z.coerce.number(),
    project_name: z.string(),
    total_tasks: z.coerce.number(),
    done_tasks: z.coerce.number(),
    completion_percent: z.coerce.number(),
  }),
  z.object({
    row_type: z.literal("overdue"),
    project_id: z.coerce.number(),
    project_name: z.string(),
    task_id: z.coerce.number(),
    task_title: z.string(),
    task_priority: z.enum(["low", "medium", "high"]),
    due_date: z.string(),
  }),
]);

export async function getTrackerStats(ownerId: number): Promise<TrackerStats> {
  const [totalsRows, detailsRows] = await Promise.all([
    sql`
      SELECT
        (SELECT COUNT(*) FROM projects WHERE owner_id = ${ownerId})::int AS total_projects,
        COUNT(t.id)::int AS total_tasks,
        COUNT(*) FILTER (WHERE t.status = 'todo')::int AS todo_tasks,
        COUNT(*) FILTER (WHERE t.status = 'doing')::int AS doing_tasks,
        COUNT(*) FILTER (WHERE t.status = 'done')::int AS done_tasks,
        COUNT(*) FILTER (WHERE t.priority = 'low')::int AS low_priority_tasks,
        COUNT(*) FILTER (WHERE t.priority = 'medium')::int AS medium_priority_tasks,
        COUNT(*) FILTER (WHERE t.priority = 'high')::int AS high_priority_tasks,
        COUNT(*) FILTER (
          WHERE t.due_date < CURRENT_DATE AND t.status <> 'done'
        )::int AS overdue_tasks
      FROM tasks AS t
      INNER JOIN projects AS p ON p.id = t.project_id
      WHERE p.owner_id = ${ownerId}
    `,
    sql`
      SELECT
        'project'::text AS row_type,
        p.id AS project_id,
        p.name AS project_name,
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_tasks,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND(
            100.0 * COUNT(t.id) FILTER (WHERE t.status = 'done') / COUNT(t.id)
          )::int
        END AS completion_percent,
        NULL::int AS task_id,
        NULL::text AS task_title,
        NULL::text AS task_priority,
        NULL::text AS due_date
      FROM projects AS p
      LEFT JOIN tasks AS t ON t.project_id = p.id
      WHERE p.owner_id = ${ownerId}
      GROUP BY p.id, p.name

      UNION ALL

      SELECT
        'overdue'::text AS row_type,
        p.id AS project_id,
        p.name AS project_name,
        NULL::int AS total_tasks,
        NULL::int AS done_tasks,
        NULL::int AS completion_percent,
        t.id AS task_id,
        t.title AS task_title,
        t.priority::text AS task_priority,
        t.due_date::text AS due_date
      FROM tasks AS t
      INNER JOIN projects AS p ON p.id = t.project_id
      WHERE t.due_date < CURRENT_DATE
        AND t.status <> 'done'
        AND p.owner_id = ${ownerId}
      ORDER BY row_type, project_name, due_date
    `,
  ]);

  const totals = totalsRowSchema.parse(totalsRows[0]);
  const details = detailsRows.map((row) => statsDetailRowSchema.parse(row));

  return {
    totals: {
      projects: totals.total_projects,
      tasks: totals.total_tasks,
      todo: totals.todo_tasks,
      doing: totals.doing_tasks,
      done: totals.done_tasks,
      low: totals.low_priority_tasks,
      medium: totals.medium_priority_tasks,
      high: totals.high_priority_tasks,
      overdue: totals.overdue_tasks,
    },
    projects: details
      .filter((row) => row.row_type === "project")
      .map((row) => ({
        id: row.project_id,
        name: row.project_name,
        totalTasks: row.total_tasks,
        doneTasks: row.done_tasks,
        completionPercent: row.completion_percent,
      })),
    overdueTasks: details
      .filter((row) => row.row_type === "overdue")
      .map((row) => ({
        id: row.task_id,
        projectId: row.project_id,
        projectName: row.project_name,
        title: row.task_title,
        priority: row.task_priority,
        dueDate: row.due_date,
      })),
  };
}

export async function getProjects(ownerId: number): Promise<ProjectWithProgress[]> {
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
    WHERE p.owner_id = ${ownerId}
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

export async function getProject(ownerId: number, id: number): Promise<Project | null> {
  const rows = await sql`
    SELECT id, name, description, color, created_at
    FROM projects
    WHERE id = ${id} AND owner_id = ${ownerId}
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
  ownerId: number,
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
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = ${projectId}
          AND projects.owner_id = ${ownerId}
      )
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
