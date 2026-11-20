import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getTrackerStats } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Stats",
  description: "Project and task statistics",
};

const statusLabels = [
  { key: "todo", label: "To do", color: "bg-slate-500" },
  { key: "doing", label: "Doing", color: "bg-blue-600" },
  { key: "done", label: "Done", color: "bg-emerald-600" },
] as const;

const priorityLabels = [
  { key: "low", label: "Low", color: "bg-slate-500" },
  { key: "medium", label: "Medium", color: "bg-amber-500" },
  { key: "high", label: "High", color: "bg-rose-600" },
] as const;

function BarChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-zinc-600">{item.label}</span>
            <span className="font-medium text-zinc-900">{item.value}</span>
          </div>
          <div
            role="img"
            aria-label={`${item.label}: ${item.value}`}
            className="h-2.5 overflow-hidden rounded-full bg-zinc-100"
          >
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  const user = await requireUser();
  await connection();
  const stats = await getTrackerStats(user.id);
  const summaryCards = [
    { label: "Projects", value: stats.totals.projects },
    { label: "Tasks", value: stats.totals.tasks },
    { label: "Completed", value: stats.totals.done },
    { label: "Overdue", value: stats.totals.overdue },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
        &larr; All projects
      </Link>
      <header className="mb-8 mt-5">
        <p className="text-sm font-medium text-zinc-500">Workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
          Statistics
        </h1>
      </header>

      <section
        aria-label="Overall totals"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-950">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-5 text-lg font-semibold text-zinc-950">
            Tasks by status
          </h2>
          <BarChart
            items={statusLabels.map((item) => ({
              label: item.label,
              value: stats.totals[item.key],
              color: item.color,
            }))}
          />
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-5 text-lg font-semibold text-zinc-950">
            Tasks by priority
          </h2>
          <BarChart
            items={priorityLabels.map((item) => ({
              label: item.label,
              value: stats.totals[item.key],
              color: item.color,
            }))}
          />
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-5 text-lg font-semibold text-zinc-950">
          Completion by project
        </h2>
        {stats.projects.length === 0 ? (
          <p className="text-sm text-zinc-500">No projects yet.</p>
        ) : (
          <div className="space-y-5">
            {stats.projects.map((project) => {
              const percent = project.completionPercent;

              return (
                <div key={project.id}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-zinc-800 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <span className="shrink-0 text-zinc-500">
                      {percent}% ({project.doneTasks}/{project.totalTasks})
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${project.name}: ${percent}% complete`}
                    className="h-2.5 overflow-hidden rounded-full bg-zinc-100"
                  >
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-950">
          Overdue tasks
        </h2>
        {stats.overdueTasks.length === 0 ? (
          <p className="text-sm text-zinc-500">No overdue tasks.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {stats.overdueTasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">{task.title}</p>
                  <Link
                    href={`/projects/${task.projectId}`}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    {task.projectName}
                  </Link>
                </div>
                <p className="text-sm font-medium text-red-600">
                  Due {task.dueDate} · {task.priority} priority
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
