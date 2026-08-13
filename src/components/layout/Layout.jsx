import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import styles from './Layout.module.css';

/**
 * Structure shared by every view: the header pinned at the top and the content
 * of the active route below it.
 */
export function Layout() {
  return (
    <>
      <a href="#contenido" className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <Header />

      <main id="contenido" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Prueba técnica front-end · Catálogo de dispositivos móviles</p>
      </footer>
    </>
  );
}
