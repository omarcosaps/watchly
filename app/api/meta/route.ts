import { getCountriesList, getMergedGenres } from "@/lib/catalog/get-meta"
import { jsonError } from "@/lib/http"

export async function GET() {
  try {
    const [countries, genres] = await Promise.all([getCountriesList(), getMergedGenres()])
    return Response.json({ countries, genres })
  } catch (error) {
    return jsonError(error)
  }
}
