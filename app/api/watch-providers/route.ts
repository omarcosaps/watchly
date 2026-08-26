import { NextRequest } from "next/server"

import { getRegionProviders } from "@/lib/catalog/get-meta"
import { jsonError, requireRegion } from "@/lib/http"

export async function GET(request: NextRequest) {
  try {
    const region = requireRegion(request.nextUrl.searchParams.get("region"))
    const providers = await getRegionProviders(region)
    return Response.json({ providers })
  } catch (error) {
    return jsonError(error)
  }
}
