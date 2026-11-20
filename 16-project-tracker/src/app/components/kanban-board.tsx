"use client";

import { startTransition, useOptimistic, useState } from "react";
import type { Task, TaskStatus } from "@/lib/queries";
import { updateTaskStatus } from "../actions";
import { DeleteTaskButton } from "./task-actions";

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "doing", title: "Doing" },
  { status: "done", title: "Done" },
];

const priorityClasses = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

function localDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function KanbanBoard({
  projectId,
  tasks,
}: {
  projectId: number;
  tasks: Task[];
}) {
  const [boardTasks, setBoardTasks] = useOptimistic(
    tasks,
    (currentTasks, update: { taskId: number; status: TaskStatus }) =>
      currentTasks.map((task) =>
        task.id === update.taskId ? { ...task, status: update.status } : task,
      ),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function moveTask(task: Task, nextStatus: TaskStatus) {
    setError(null);
    setPending(true);
    startTransition(async () => {
      setBoardTasks({ taskId: task.id, status: nextStatus });
      const formData = new FormData();
      formData.set("task_id", String(task.id));
      formData.set("project_id", String(projectId));
      formData.set("status", nextStatus);

      try {
        const result = await updateTaskStatus(
          { ok: false, errors: {} },
          formData,
        );
        if (!result.ok) {
          setError(
            result.errors.task_id?.[0] ??
              result.errors.status?.[0] ??
              "Could not move task.",
          );
        }
      } catch {
        setError("Could not move task. Please try again.");
      } finally {
        setPending(false);
      }
    });
  }

  const today = localDateString();

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid items-start gap-5 md:grid-cols-3">
        {columns.map((column, columnIndex) => {
          const columnTasks = boardTasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <section
              key={column.status}
              aria-labelledby={`column-${column.status}`}
              className="min-h-64 rounded-2xl bg-zinc-100 p-4"
            >
              <header className="mb-4 flex items-center justify-between">
                <h2
                  id={`column-${column.status}`}
                  className="font-semibold text-zinc-900"
                >
                  {column.title}
                </h2>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {columnTasks.length}
                </span>
              </header>

              {columnTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500">
                  No tasks in this column.
                </p>
              ) : (
                <div className="space-y-3">
                  {columnTasks.map((task) => {
                    const overdue = task.dueDate !== null && task.dueDate < today;

                    return (
                      <article
                        key={task.id}
                        className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-zinc-950">
                            {task.title}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityClasses[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p
                          className={`mt-3 text-sm ${overdue ? "font-medium text-red-600" : "text-zinc-500"}`}
                        >
                          {task.dueDate
                            ? `${overdue ? "Overdue · " : "Due "}${task.dueDate}`
                            : "No due date"}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                          <div className="flex gap-2">
                            {columnIndex > 0 && (
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                  moveTask(task, columns[columnIndex - 1].status)
                                }
                                className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                aria-label={`Move ${task.title} left to ${columns[columnIndex - 1].title}`}
                              >
                                &larr;
                              </button>
                            )}
                            {columnIndex < columns.length - 1 && (
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                  moveTask(task, columns[columnIndex + 1].status)
                                }
                                className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                aria-label={`Move ${task.title} right to ${columns[columnIndex + 1].title}`}
                              >
                                &rarr;
                              </button>
                            )}
                          </div>
                          <DeleteTaskButton projectId={projectId} taskId={task.id} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {pending ? "Moving task" : ""}
      </span>
    </div>
  );
}
