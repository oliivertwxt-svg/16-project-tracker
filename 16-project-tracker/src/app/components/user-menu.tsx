import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export async function UserMenu() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Sign in with GitHub
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image ? (
        // GitHub avatars are remote; a native image keeps the server component dependency-free.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt=""
          width={36}
          height={36}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700">
          {session.user.name?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      <div className="hidden min-w-0 sm:block">
        <Link href="/" className="block max-w-40 truncate text-sm font-medium text-zinc-900">
          {session.user.name || "GitHub user"}
        </Link>
      </div>
      <Link
        href="/settings"
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Settings
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
