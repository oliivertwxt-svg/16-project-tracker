import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { sql } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "github") {
        return false;
      }

      const githubId = account.providerAccountId;
      const rows = await sql`
        INSERT INTO users (github_id, name, email, image)
        VALUES (${githubId}, ${user.name ?? null}, ${user.email ?? null}, ${user.image ?? null})
        ON CONFLICT (github_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          image = EXCLUDED.image
        RETURNING id
      `;

      if (rows.length !== 1) {
        return false;
      }

      user.id = String(Number(rows[0].id));
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = Number(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        return {
          ...session,
          user: {
            ...session.user,
            id: Number(token.userId),
          },
        };
      }
      return session;
    },
  },
});
