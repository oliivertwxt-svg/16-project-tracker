import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getProject, getTasks } from "@/lib/queries";
import { NewTaskForm } from "../../components/new-task-form";
import { KanbanBoard } from "../../components/kanban-board";
import { DeleteProjectButton } from "../../components/delete-project-button";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return { title: "Project not found" };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.name,
    description: project.description || `Tasks for ${project.name}`,
  };
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    notFound();
  }

  const project = await getProject(projectId);
  if (!project) {
    notFound();
  }

  const rawPriority = typeof query.priority === "string" ? query.priority : "";
  const parsedPriority = z
    .enum(["low", "medium", "high"])
    .safeParse(rawPriority);
  const searchQuery = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const tasks = await getTasks(projectId, {
    priority: parsedPriority.success ? parsedPriority.data : undefined,
    q: searchQuery || undefined,
  });

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
        <form
          method="get"
          action={`/projects/${project.id}`}
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row"
        >
          <label className="grid flex-1 gap-1 text-sm font-medium text-zinc-700">
            Search tasks
            <input
              name="q"
              type="search"
              maxLength={100}
              defaultValue={searchQuery}
              placeholder="Search title..."
              className="h-10 rounded-lg border border-zinc-300 px-3"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Priority
            <select
              name="priority"
              defaultValue={parsedPriority.success ? parsedPriority.data : ""}
              className="h-10 rounded-lg border border-zinc-300 px-3"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-auto h-10 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white"
          >
            Filter
          </button>
        </form>
        <KanbanBoard projectId={project.id} tasks={tasks} />
      </section>
    </main>
  );
}
