import { useCallback, useEffect, useState } from 'react'
import { fetchAllProducts } from '../api/products'
import type { Product } from '../types/product'

const PAGE_SIZE = 6

interface UseProductsResult {
  products: Product[]
  totalPages: number
  currentPage: number
  loading: boolean
  error: string | null
  setPage: (page: number) => void
  retry: () => void
}

export function useProducts(): UseProductsResult {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchAllProducts()
      .then((data) => {
        if (!cancelled) {
          setAllProducts(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [fetchKey])

  const retry = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  const totalPages = Math.ceil(allProducts.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const products = allProducts.slice(start, start + PAGE_SIZE)

  return {
    products,
    totalPages,
    currentPage,
    loading,
    error,
    setPage: setCurrentPage,
    retry,
  }
}
