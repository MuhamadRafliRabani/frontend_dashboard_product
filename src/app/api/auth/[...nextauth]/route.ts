import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: "Ov23lin1eYTjOmY1hGP6",
      clientSecret: "1817305c2cb1f28ceddd9aaf90488e5bc60bf0d6",
    }),
  ],
});

export { handler as GET, handler as POST };
