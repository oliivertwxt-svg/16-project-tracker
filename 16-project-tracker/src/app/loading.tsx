export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <div className="mb-8 h-16 animate-pulse rounded-lg bg-zinc-100" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100"
          />
        ))}
      </div>
    </main>
  );
}
