import { NextRequest } from "next/server"

import { getTitleDetails } from "@/lib/catalog/get-title"
import { parseProviderIds } from "@/lib/catalog/params"
import { jsonError, requireRegion } from "@/lib/http"
import { mediaFromTipo } from "@/lib/media"

type RouteContext = {
  params: Promise<{ tipo: string; id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tipo, id } = await context.params
    const mediaType = mediaFromTipo(tipo)
    const tmdbId = Number.parseInt(id, 10)

    if (!mediaType || !Number.isInteger(tmdbId) || tmdbId <= 0) {
      return Response.json({ error: "Título não encontrado" }, { status: 404 })
    }

    const params = request.nextUrl.searchParams
    const details = await getTitleDetails({
      mediaType,
      tmdbId,
      region: requireRegion(params.get("region")),
      providerIds: parseProviderIds(params.get("providers")),
    })

    return Response.json(details)
  } catch (error) {
    return jsonError(error)
  }
}
