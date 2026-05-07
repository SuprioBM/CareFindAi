// app/(auth)/register/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from 'react'
import ManualSearchPage from '../../(pages)/manual-search/component/manualSearch'

export default function ManualSearch() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManualSearchPage />
    </Suspense>
  )
}