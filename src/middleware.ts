import { type NextRequest, NextResponse } from "next/server";

// Middleware simplificado — só refresha sessão, sem redirecionamento forçado
// Cada página gerencia seu próprio acesso
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
