export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/diagnostic/:path*",
    "/diagnostic",
  ],
};
