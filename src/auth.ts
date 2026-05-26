import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    // Fires once, right after the PrismaAdapter has inserted a new User row.
    // This is where we attach them to a household: either consume a pending
    // invitation for their email, or create a fresh household.
    async createUser({ user }) {
      if (!user?.id || !user.email) return;
      const email = user.email.toLowerCase();

      const invite = await prisma.invitation.findFirst({
        where: { email, acceptedAt: null },
        orderBy: { createdAt: "asc" },
      });

      if (invite) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { householdId: invite.householdId },
          }),
          prisma.invitation.update({
            where: { id: invite.id },
            data: { acceptedAt: new Date() },
          }),
        ]);
        return;
      }

      const household = await prisma.household.create({
        data: { name: `${user.name ?? "My"}'s plants` },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { householdId: household.id },
      });
    },
  },
  callbacks: {
    // Attach householdId to the session object for easy access in server components.
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { householdId: true },
        });
        session.user.householdId = dbUser?.householdId ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
