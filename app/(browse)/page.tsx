import { Suspense } from "react"

import { CatalogHome } from "@/components/catalog-home"

export default function HomePage() {
  return (
    <Suspense>
      <CatalogHome />
    </Suspense>
  )
}
