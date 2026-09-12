import { Suspense } from "react"

import { CatalogHome } from "@/components/catalog-home"
import { CatalogSkeleton } from "@/components/catalog-grid"

export default function HomePage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogHome />
    </Suspense>
  )
}
