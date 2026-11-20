import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser(): Promise<{ id: number }> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return { id: session.user.id };
}
