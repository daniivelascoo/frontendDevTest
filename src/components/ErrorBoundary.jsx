import { Component } from 'react';

/**
 * Safety net for render errors.
 *
 * React unmounts the whole tree if a component throws during render, so without
 * an error boundary a one-off failure would leave the page blank. It has to be
 * a class component: there is no hook equivalent.
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
    // In a real project this is where the monitoring service call would go.
    console.error('Unhandled error in the React tree:', error, errorInfo);
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
