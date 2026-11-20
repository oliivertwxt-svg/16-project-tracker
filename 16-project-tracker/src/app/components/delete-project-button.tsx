"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject, type ActionResult } from "../actions";

const initialState: ActionResult = { ok: false, errors: {} };

export function DeleteProjectButton({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (previousState: ActionResult, formData: FormData) => {
      const result = await deleteProject(previousState, formData);
      if (result.ok) {
        router.push("/");
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="project_id" value={projectId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Delete project"}
      </button>
      {state.errors.project_id?.map((error) => (
        <p key={error} className="mt-2 text-sm text-red-600">{error}</p>
      ))}
    </form>
  );
}
