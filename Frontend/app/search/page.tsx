"use client"

import { Suspense } from 'react'
import SearchContent from './search-content'

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '140px 60px 80px' }}><div style={{ maxWidth: 1200, margin: '0 auto', minHeight: 400 }} /></div>}>
      <SearchContent />
    </Suspense>
  )
}

