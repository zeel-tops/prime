import type { Product } from '../types/product'

const BASE_URL = 'https://fakestoreapi.com'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchAllProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/products`)
  if (!response.ok) {
    throw new ApiError(`Failed to fetch products: ${response.statusText}`, response.status)
  }
  return response.json() as Promise<Product[]>
}
