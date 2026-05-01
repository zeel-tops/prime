import styles from "./Pagination.module.css";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Product pages">
      <button
        className={styles.btn}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &#8592; Prev
      </button>

      <span className={styles.info}>
        Page {page} of {totalPages}
      </span>

      <button
        className={styles.btn}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next &#8594;
      </button>
    </nav>
  );
}
