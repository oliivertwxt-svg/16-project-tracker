"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6">
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-red-950">
          Could not load projects
        </h1>
        <p className="mt-2 text-sm text-red-700">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
