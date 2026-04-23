"use client"

import { Suspense } from 'react'
import ProductsContent from './products-content'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '140px 60px 80px' }}><div style={{ maxWidth: 1200, margin: '0 auto', minHeight: 400 }} /></div>}>
      <ProductsContent />
    </Suspense>
  )
}

