import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./Pagination";
import styles from "./ProductList.module.css";

const PAGE_SIZE = 8;

export function ProductList() {
  const { products, loading, error, retry } = useProducts();
  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <div className={styles.center}>
        <span className={styles.spinner} aria-label="Loading products" />
        <p className={styles.loadingText}>Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.center}>
        <p className={styles.emptyText}>No products found.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageProducts = products.slice(start, start + PAGE_SIZE);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section>
      <div className={styles.grid}>
        {pageProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  );
}
