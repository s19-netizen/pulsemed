import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const isProd = process.env.NODE_ENV === "production";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  // On localhost (HTTP) NextAuth can't set __Secure- prefixed cookies, so we
  // override to plain names. In production (HTTPS/Vercel) use secure defaults.
  ...(!isProd ? {
    useSecureCookies: false,
    cookies: {
      sessionToken: { name: "next-auth.session-token", options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false } },
      callbackUrl: { name: "next-auth.callback-url", options: { sameSite: "lax" as const, path: "/", secure: false } },
      csrfToken: { name: "next-auth.csrf-token", options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false } },
      state: { name: "next-auth.state", options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false, maxAge: 900 } },
      pkceCodeVerifier: { name: "next-auth.pkce.code_verifier", options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false } },
    },
  } : {}),
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        await serviceSupabase.from("users").upsert({
          id: user.email,
          name: user.name ?? null,
          email: user.email,
        }, { onConflict: "id", ignoreDuplicates: true });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        (token as any).userId = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).userId ?? session.user.email;
      }
      return session;
    },
  },
};
