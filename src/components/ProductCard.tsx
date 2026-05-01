import type { Product } from "../services/api";
import styles from "./ProductCard.module.css";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.image}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/200x200?text=No+Image";
          }}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.category}>{product.category}</p>
        <h2 className={styles.title}>{product.title}</h2>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
      </div>
    </article>
  );
}
