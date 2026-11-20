"use client";

import { useActionState } from "react";
import { createTask, type ActionResult } from "../actions";

const initialState: ActionResult = { ok: false, errors: {} };

export function NewTaskForm({ projectId }: { projectId: number }) {
  const [state, formAction, pending] = useActionState(
    createTask,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-5"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <h2 className="text-lg font-semibold text-zinc-950">New task</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Title
          <input
            name="title"
            required
            className="h-10 rounded-lg border border-zinc-300 px-3"
          />
          {state.errors.title?.map((error) => (
            <span key={error} className="text-xs text-red-600">{error}</span>
          ))}
        </label>
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Status
          <select name="status" defaultValue="todo" className="h-10 rounded-lg border border-zinc-300 px-3">
            <option value="todo">To do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Priority
          <select name="priority" defaultValue="medium" className="h-10 rounded-lg border border-zinc-300 px-3">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Due date
          <input name="due_date" type="date" className="h-10 rounded-lg border border-zinc-300 px-3" />
          {state.errors.due_date?.map((error) => (
            <span key={error} className="text-xs text-red-600">{error}</span>
          ))}
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add task"}
        </button>
      </div>
      {state.errors.project_id?.map((error) => (
        <p key={error} className="mt-3 text-sm text-red-600">{error}</p>
      ))}
      {state.message && state.ok && (
        <p className="mt-3 text-sm text-green-700">{state.message}</p>
      )}
    </form>
  );
}
