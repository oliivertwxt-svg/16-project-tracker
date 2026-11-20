import Link from "next/link";
import { getProjects } from "@/lib/queries";
import { NewProjectForm } from "./components/new-project-form";

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-zinc-500">Workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
          Projects
        </h1>
      </header>

      <NewProjectForm />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          No projects yet.
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const progress =
              project.totalTasks === 0
                ? 0
                : Math.round((project.doneTasks / project.totalTasks) * 100);

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: project.color }}
                />
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">
                    <Link
                      href={`/projects/${project.id}`}
                      className="hover:underline"
                    >
                      {project.name}
                    </Link>
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">
                    {project.description || "No description"}
                  </p>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Progress</span>
                      <span className="font-medium text-zinc-700">
                        {project.doneTasks}/{project.totalTasks}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
