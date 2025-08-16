export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // protect only private areas; keep "/", "/auth/*", "/api/*" public
    "/dashboard/:path*",
  ],
};
