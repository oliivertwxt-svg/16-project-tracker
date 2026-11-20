"use client";

import { useActionState } from "react";
import { createProject, type ActionResult } from "../actions";

const initialState: ActionResult = { ok: false, errors: {} };

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5"
    >
      <h2 className="text-lg font-semibold text-zinc-950">New project</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_2fr_140px_auto] sm:items-end">
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Name
          <input
            name="name"
            required
            className="h-10 rounded-lg border border-zinc-300 px-3"
          />
          {state.errors.name?.map((error) => (
            <span key={error} className="text-xs text-red-600">{error}</span>
          ))}
        </label>
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Description
          <input
            name="description"
            className="h-10 rounded-lg border border-zinc-300 px-3"
          />
          {state.errors.description?.map((error) => (
            <span key={error} className="text-xs text-red-600">{error}</span>
          ))}
        </label>
        <label className="grid gap-1 text-sm font-medium text-zinc-700">
          Colour
          <input
            name="color"
            type="color"
            defaultValue="#2563eb"
            required
            className="h-10 w-full rounded-lg border border-zinc-300 p-1"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create project"}
        </button>
      </div>
      {state.message && state.ok && (
        <p className="mt-3 text-sm text-green-700">{state.message}</p>
      )}
    </form>
  );
}
