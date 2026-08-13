import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary.jsx';

/** Component that blows up on render, depending on what it is told. */
function Explosive({ fails }) {
  if (fails) throw new Error('Boom');
  return <p>Contenido correcto</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs the error to the console even when the boundary catches it,
    // and `componentDidCatch` logs another. Silencing them keeps the test
    // output clean of a failure that is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('lets the content through while there are no errors', () => {
    render(
      <ErrorBoundary>
        <Explosive fails={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Contenido correcto')).toBeInTheDocument();
  });

  it('shows a message instead of leaving the page blank', () => {
    render(
      <ErrorBoundary>
        <Explosive fails />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Algo ha salido mal');
    expect(screen.queryByText('Contenido correcto')).not.toBeInTheDocument();
  });

  it('logs the error so it can reach monitoring', () => {
    render(
      <ErrorBoundary>
        <Explosive fails />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Unhandled error in the React tree:',
      expect.objectContaining({ message: 'Boom' }),
      expect.anything()
    );
  });

  it('allows retrying and recovers the content if the error no longer repeats', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <Explosive fails />
      </ErrorBoundary>
    );

    // The child stops failing before the retry; otherwise the boundary would
    // catch the same error again and the button would look like it does nothing.
    rerender(
      <ErrorBoundary>
        <Explosive fails={false} />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.getByText('Contenido correcto')).toBeInTheDocument();
  });
});
