import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getTasks } from "@/lib/queries";
import { NewTaskForm } from "../../components/new-task-form";
import { DeleteTaskButton, TaskStatusSelect } from "../../components/task-actions";
import { DeleteProjectButton } from "../../components/delete-project-button";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    notFound();
  }

  const project = await getProject(projectId);
  if (!project) {
    notFound();
  }

  const tasks = await getTasks(projectId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
        &larr; All projects
      </Link>

      <header className="mt-5">
        <div className="h-2 rounded-full" style={{ backgroundColor: project.color }} />
        <div className="mt-4 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-zinc-950">{project.name}</h1>
          <DeleteProjectButton projectId={project.id} />
        </div>
        <p className="mt-2 text-zinc-600">{project.description || "No description"}</p>
      </header>

      <div className="mt-8">
        <NewTaskForm projectId={project.id} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-950">Tasks</h2>
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No tasks yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-zinc-950">{task.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {task.priority} priority
                    {task.dueDate ? ` · Due ${task.dueDate}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <TaskStatusSelect
                    projectId={project.id}
                    taskId={task.id}
                    status={task.status}
                  />
                  <DeleteTaskButton projectId={project.id} taskId={task.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
