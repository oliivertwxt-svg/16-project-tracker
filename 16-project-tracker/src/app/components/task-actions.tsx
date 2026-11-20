"use client";

import { useActionState } from "react";
import {
  deleteTask,
  updateTaskStatus,
  type ActionResult,
} from "../actions";
import type { TaskStatus } from "@/lib/queries";

const initialState: ActionResult = { ok: false, errors: {} };

export function TaskStatusSelect({
  projectId,
  taskId,
  status,
}: {
  projectId: number;
  taskId: number;
  status: TaskStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateTaskStatus,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="task_id" value={taskId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
      >
        <option value="todo">To do</option>
        <option value="doing">Doing</option>
        <option value="done">Done</option>
      </select>
      {state.errors.task_id?.map((error) => (
        <span key={error} className="text-xs text-red-600">{error}</span>
      ))}
    </form>
  );
}

export function DeleteTaskButton({
  projectId,
  taskId,
}: {
  projectId: number;
  taskId: number;
}) {
  const [state, formAction, pending] = useActionState(deleteTask, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="task_id" value={taskId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Delete"}
      </button>
      {state.errors.task_id?.map((error) => (
        <span key={error} className="ml-2 text-xs text-red-600">{error}</span>
      ))}
    </form>
  );
}
