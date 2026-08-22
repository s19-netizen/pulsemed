import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

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

    CredentialsProvider({
      id: "student-credentials",
      name: "Student",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const { data: student } = await serviceSupabase
          .from("students")
          .select("id, name, username, password_hash")
          .eq("username", credentials.username.trim().toLowerCase())
          .single();
        if (!student) return null;
        const valid = await bcrypt.compare(credentials.password, student.password_hash);
        if (!valid) return null;
        return { id: student.id, name: student.name, email: `student::${student.username}`, role: "student" } as any;
      },
    }),

    CredentialsProvider({
      id: "tutor-credentials",
      name: "Tutor",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { data: tutor } = await serviceSupabase
          .from("tutors")
          .select("id, name, email, password_hash")
          .eq("email", credentials.email.trim().toLowerCase())
          .single();
        if (!tutor) return null;
        const valid = await bcrypt.compare(credentials.password, tutor.password_hash);
        if (!valid) return null;
        return { id: tutor.id, name: tutor.name, email: tutor.email, role: "tutor" } as any;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: { strategy: "jwt" },
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
    async signIn({ user, account }) {
      // Only upsert into users table for Google sign-ins
      if (account?.provider === "google" && user?.email) {
        await serviceSupabase.from("users").upsert({
          id: user.email,
          name: user.name ?? null,
          email: user.email,
        }, { onConflict: "id", ignoreDuplicates: true });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id ?? user.email;
        token.role = (user as any).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId ?? session.user.email;
        (session.user as any).role = token.role ?? "user";
      }
      return session;
    },
  },
};
