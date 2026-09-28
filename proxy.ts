import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

export const proxy = async (request: NextRequest) => {
  return updateSession(request)
}

export const config = {
  matcher: [
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/atualizar-senha",
    "/verificar-email",
    "/auth/callback",
    "/watchlist",
    "/preferencias",
    "/onboarding",
  ],
}
