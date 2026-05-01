import { useState, useEffect } from "react";
import { fetchProducts, type Product } from "../services/api";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const retry = () => setTick((t) => t + 1);

  return { products, loading, error, retry };
}
