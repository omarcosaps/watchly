import { NextRequest } from "next/server"

import { getCatalogPage } from "@/lib/catalog/get-catalog"
import {
  parseMediaFilter,
  parseMonetization,
  parseOptionalInt,
  parseOptionalYear,
  parsePage,
  parseProviderIds,
  parseSort,
  parseYearRange,
} from "@/lib/catalog/params"
import { jsonError, requireRegion } from "@/lib/http"

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const region = requireRegion(params.get("region"))
    const providerIds = parseProviderIds(params.get("providers"))
    const filteredProviderIds = parseProviderIds(params.get("filterProviders"))
    const page = await getCatalogPage({
      region,
      providerIds,
      page: parsePage(params.get("page")),
      media: parseMediaFilter(params.get("media")),
      monetizationTypes: parseMonetization(params.get("monetization")),
      genreMovieId: parseOptionalInt(params.get("genreMovie")),
      genreTvId: parseOptionalInt(params.get("genreTv")),
      year: parseOptionalYear(params.get("year")),
      yearRange: parseYearRange(params.get("yearRange")),
      sort: parseSort(params.get("sort")),
      filteredProviderIds: filteredProviderIds.length > 0 ? filteredProviderIds : undefined,
    })

    return Response.json(page)
  } catch (error) {
    return jsonError(error)
  }
}
