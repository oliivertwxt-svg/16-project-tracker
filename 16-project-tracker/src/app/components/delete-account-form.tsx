"use client";

import { useActionState, type FormEvent } from "react";
import { deleteAccount, type DeleteAccountState } from "../actions";

const initialState: DeleteAccountState = {};

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialState,
  );

  function confirmDeletion(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Permanently delete your account and all its projects?")) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      method="post"
      onSubmit={confirmDeletion}
      className="mt-5 space-y-4"
    >
      <label className="flex items-start gap-3 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="confirm_delete"
          value="yes"
          required
          className="mt-1"
        />
        <span>
          I understand that deleting my account permanently removes my account
          and all of its projects and tasks.
        </span>
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
      >
        {pending ? "Deleting account..." : "Delete my account"}
      </button>
    </form>
  );
}
