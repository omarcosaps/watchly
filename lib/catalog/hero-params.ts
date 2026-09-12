export const heroCatalogParams = () => {
  const params = new URLSearchParams()
  params.set("page", "1")
  params.set("sort", "trending")
  return params
}
