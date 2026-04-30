import type { Product } from '../types/product'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.image}
          loading="lazy"
        />
      </div>
      <div className={styles.body}>
        <p className={styles.category}>{product.category}</p>
        <h2 className={styles.title} title={product.title}>
          {product.title}
        </h2>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <div className={styles.rating}>
          <span className={styles.ratingScore}>★ {product.rating.rate.toFixed(1)}</span>
          <span className={styles.ratingCount}>({product.rating.count})</span>
        </div>
      </div>
    </article>
  )
}
