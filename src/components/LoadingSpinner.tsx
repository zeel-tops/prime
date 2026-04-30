import styles from './LoadingSpinner.module.css'

export function LoadingSpinner() {
  return (
    <div className={styles.container} role="status" aria-label="Loading products">
      <div className={styles.spinner} />
      <p className={styles.text}>Loading products…</p>
    </div>
  )
}
