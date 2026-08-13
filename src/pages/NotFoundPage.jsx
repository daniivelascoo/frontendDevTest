import { Link } from 'react-router-dom';
import { StatusMessage } from '../components/ui/StatusMessage.jsx';
import { useSetBreadcrumbs } from '../context/breadcrumbsContext.js';

/**
 * Unrecognised route.
 *
 * Being an SPA with client-side routing, any unknown URL reaches the router; it
 * is worth answering with something better than a blank screen.
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
