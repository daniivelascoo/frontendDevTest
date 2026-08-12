import { Link } from 'react-router-dom';
import { StatusMessage } from '../components/ui/StatusMessage.jsx';
import { useSetBreadcrumbs } from '../context/breadcrumbsContext.js';

/**
 * Ruta no reconocida.
 *
 * Al ser una SPA con enrutado en cliente, cualquier URL desconocida llega al
 * router; conviene responder con algo mejor que una pantalla en blanco.
 */
export function NotFoundPage() {
  useSetBreadcrumbs([{ label: 'Inicio', to: '/' }, { label: 'Página no encontrada' }]);

  return (
    <StatusMessage
      variant="empty"
      title="Página no encontrada"
      description="La dirección a la que intentas acceder no existe."
    >
      <Link to="/">Volver al listado de productos</Link>
    </StatusMessage>
  );
}
