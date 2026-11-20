"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { ProjectInput, TaskInput, taskStatusSchema } from "@/lib/validation";
import { auth } from "@/auth";

export type ActionResult = {
  ok: boolean;
  errors: Record<string, string[]>;
  message?: string;
};

const idSchema = z.coerce.number().int().positive();

async function requireUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in");
  }
  return session.user.id;
}

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

export async function createProject(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = ProjectInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  await sql`
    INSERT INTO projects (name, description, color, owner_id)
    VALUES (${parsed.data.name}, ${parsed.data.description}, ${parsed.data.color}, ${ownerId})
  `;

  revalidatePath("/");
  return { ok: true, errors: {}, message: "Project created" };
}

export async function createTask(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const projectIdResult = idSchema.safeParse(formData.get("project_id"));
  const parsed = TaskInput.safeParse({
    title: formData.get("title"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
  });

  if (!projectIdResult.success) {
    return {
      ok: false,
      errors: { project_id: ["A valid project is required"] },
    };
  }
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const projects = await sql`
    SELECT id FROM projects
    WHERE id = ${projectIdResult.data} AND owner_id = ${ownerId}
    LIMIT 1
  `;
  if (projects.length === 0) {
    return {
      ok: false,
      errors: { project_id: ["Project does not exist"] },
    };
  }

  await sql`
    INSERT INTO tasks (project_id, title, status, priority, due_date)
    VALUES (
      ${projectIdResult.data},
      ${parsed.data.title},
      ${parsed.data.status},
      ${parsed.data.priority},
      ${parsed.data.due_date}
    )
  `;

  revalidatePath(`/projects/${projectIdResult.data}`);
  revalidatePath("/");
  return { ok: true, errors: {}, message: "Task created" };
}

export async function updateTaskStatus(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const ids = z
    .object({
      task_id: idSchema,
      project_id: idSchema,
    })
    .safeParse({
      task_id: formData.get("task_id"),
      project_id: formData.get("project_id"),
    });
  const status = taskStatusSchema.safeParse(formData.get("status"));

  if (!ids.success) {
    return { ok: false, errors: { ids: ["Invalid task or project"] } };
  }
  if (!status.success) {
    return { ok: false, errors: fieldErrors(status.error) };
  }

  const result = await sql`
    UPDATE tasks
    SET status = ${status.data}
    WHERE id = ${ids.data.task_id}
      AND project_id = ${ids.data.project_id}
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = ${ids.data.project_id}
          AND projects.owner_id = ${ownerId}
      )
    RETURNING id
  `;

  if (result.length === 0) {
    return {
      ok: false,
      errors: { task_id: ["Task does not belong to this project"] },
    };
  }

  revalidatePath(`/projects/${ids.data.project_id}`);
  revalidatePath("/");
  return { ok: true, errors: {}, message: "Status updated" };
}

export async function deleteTask(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const ids = z
    .object({
      task_id: idSchema,
      project_id: idSchema,
    })
    .safeParse({
      task_id: formData.get("task_id"),
      project_id: formData.get("project_id"),
    });

  if (!ids.success) {
    return { ok: false, errors: { ids: ["Invalid task or project"] } };
  }

  const result = await sql`
    DELETE FROM tasks
    WHERE id = ${ids.data.task_id}
      AND project_id = ${ids.data.project_id}
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = ${ids.data.project_id}
          AND projects.owner_id = ${ownerId}
      )
    RETURNING id
  `;

  if (result.length === 0) {
    return {
      ok: false,
      errors: { task_id: ["Task does not belong to this project"] },
    };
  }

  revalidatePath(`/projects/${ids.data.project_id}`);
  revalidatePath("/");
  return { ok: true, errors: {}, message: "Task deleted" };
}

export async function deleteProject(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const projectId = idSchema.safeParse(formData.get("project_id"));

  if (!projectId.success) {
    return { ok: false, errors: { project_id: ["Invalid project"] } };
  }

  const result = await sql`
    DELETE FROM projects
    WHERE id = ${projectId.data} AND owner_id = ${ownerId}
    RETURNING id
  `;
  if (result.length === 0) {
    return {
      ok: false,
      errors: { project_id: ["Project does not belong to this user"] },
    };
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId.data}`);
  return { ok: true, errors: {}, message: "Project deleted" };
}
