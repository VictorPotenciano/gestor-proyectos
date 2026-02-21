import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(request: NextRequest) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const pathname = request.nextUrl.pathname;

    // Rutas públicas (no requieren autenticación)
    const publicPaths = ["/auth", "/api/auth"];
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    // Si es una ruta pública, dejar pasar
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Si NO está logueado y intenta acceder a una ruta protegida
    if (!token) {
      const signInUrl = new URL("/auth", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Protección por rol: solo ADMIN puede acceder a /usuarios
    if (pathname.startsWith("/usuarios") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/proyectos", request.url));
    }

    // Manejar CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const response = NextResponse.next();

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Para /usuarios requiere token + rol ADMIN
        if (pathname.startsWith("/usuarios")) {
          return !!token && token.role === "ADMIN";
        }

        // Rutas públicas
        const publicPaths = ["/auth", "/api/auth"];
        const isPublic = publicPaths.some((p) => pathname.startsWith(p));

        // Si es pública, permitir acceso
        if (isPublic) {
          return true;
        }

        // Para el resto, requiere token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
