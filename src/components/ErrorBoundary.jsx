import { Component } from 'react';

/**
 * Red de seguridad ante errores de render.
 *
 * React desmonta el árbol entero si un componente lanza durante el render, así
 * que sin un límite de error un fallo puntual dejaría la página en blanco.
 * Tiene que ser un componente de clase: no existe equivalente con hooks.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // En un proyecto real, aquí iría el envío al servicio de monitorización.
    console.error('Error no controlado en el árbol de React:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div role="alert" style={{ maxWidth: '40rem', margin: '4rem auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Algo ha salido mal
        </h1>
        <p style={{ marginBottom: '1.5rem', color: '#4a4a4a' }}>
          Se ha producido un error inesperado en la aplicación. Puedes intentar continuar o recargar
          la página.
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }
}
