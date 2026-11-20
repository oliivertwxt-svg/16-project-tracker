import { auth } from "@/auth";
import { DeleteAccountForm } from "@/app/components/delete-account-form";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  await requireUser();
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-zinc-500">Account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
          Settings
        </h1>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-950">GitHub profile</h2>
        <div className="mt-5 flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-xl font-semibold text-zinc-700">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <dl className="min-w-0 space-y-1">
            <div>
              <dt className="sr-only">Name</dt>
              <dd className="truncate font-medium text-zinc-950">
                {user.name || "GitHub user"}
              </dd>
            </div>
            <div>
              <dt className="sr-only">Email</dt>
              <dd className="truncate text-sm text-zinc-600">
                {user.email || "No public email"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-800">Delete account</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          This permanently deletes your account, projects, and tasks. You will
          be signed out immediately.
        </p>
        <DeleteAccountForm />
      </section>
    </main>
  );
}
