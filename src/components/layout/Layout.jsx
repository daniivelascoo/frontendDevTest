import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import styles from './Layout.module.css';

/**
 * Estructura común a todas las vistas: cabecera fija arriba y el contenido de
 * la ruta activa debajo.
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
