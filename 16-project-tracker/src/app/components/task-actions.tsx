"use client";

import { useActionState } from "react";
import { deleteTask, type ActionResult } from "../actions";

const initialState: ActionResult = { ok: false, errors: {} };

export function DeleteTaskButton({
  projectId,
  taskId,
}: {
  projectId: number;
  taskId: number;
}) {
  const [state, formAction, pending] = useActionState(deleteTask, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this task?")) {
          event.preventDefault();
        }
      }}
    >
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
