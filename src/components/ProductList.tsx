import type { Product } from '../types/product'
import { ProductCard } from './ProductCard'
import styles from './ProductList.module.css'

interface ProductListProps {
  products: Product[]
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return <p className={styles.empty}>No products found.</p>
  }

  return (
    <ul className={styles.grid} aria-label="Product list">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
