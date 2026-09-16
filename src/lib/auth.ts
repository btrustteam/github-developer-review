import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// C5: Type-safe session.accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // GitHub implements RFC 9207 and returns `iss` on the OAuth callback.
    // @auth/core only pins this from 0.41.2; set it explicitly so the check
    // never falls back to the `https://authjs.dev` placeholder.
    GitHub({ issuer: "https://github.com/login/oauth" }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});

export { handlers, auth, signIn, signOut };
