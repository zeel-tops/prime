import { ProductList } from "./components/ProductList";
import styles from "./App.module.css";

export function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Products</h1>
      </header>
      <main className={styles.main}>
        <ProductList />
      </main>
    </div>
  );
}
