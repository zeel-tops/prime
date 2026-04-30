import styles from './ErrorMessage.module.css'

interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className={styles.container} role="alert">
      <p className={styles.title}>Something went wrong</p>
      <p className={styles.message}>{message}</p>
      <button className={styles.button} onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}
