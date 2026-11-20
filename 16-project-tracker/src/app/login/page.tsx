import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-bold text-white">
            PT
          </div>
          <h1 className="mt-5 text-2xl font-bold text-zinc-950">Project Tracker</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Sign in to manage projects and tasks.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Sign in with GitHub
          </button>
        </form>
      </section>
    </main>
  );
}
