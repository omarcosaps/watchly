import { NextRequest } from "next/server"

import { getSearchPage } from "@/lib/catalog/get-search"
import { parsePage, parseProviderIds } from "@/lib/catalog/params"
import { jsonError, requireRegion } from "@/lib/http"

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const query = (params.get("q") ?? "").trim()

    if (!query) {
      throw new Error("Digite um título para buscar")
    }

    const page = await getSearchPage({
      query,
      page: parsePage(params.get("page")),
      region: requireRegion(params.get("region")),
      providerIds: parseProviderIds(params.get("providers")),
    })

    return Response.json(page)
  } catch (error) {
    return jsonError(error)
  }
}
