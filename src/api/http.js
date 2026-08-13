import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config.js';

/**
 * Network or API error carrying enough context for the UI to decide which
 * message to show without having to inspect strings.
 *
 * Its `message` is in Spanish because `ProductDetailPage` surfaces it directly
 * to the user.
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {object} [details]
   * @param {number} [details.status] HTTP status code, if there was a response.
   * @param {string} [details.url]
   * @param {'timeout' | 'network' | 'http' | 'parse'} [details.kind]
   * @param {unknown} [details.cause]
   */
  constructor(message, { status, url, kind = 'http', cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.kind = kind;
    this.cause = cause;
  }

  /** The resource does not exist (404): the UI treats it as "product not found". */
  get isNotFound() {
    return this.status === 404;
  }

  /** Retrying makes sense for network failures, timeouts or 5xx errors. */
  get isRetryable() {
    return this.kind === 'network' || this.kind === 'timeout' || (this.status ?? 0) >= 500;
  }
}

/**
 * Performs a request against the API and returns the parsed JSON.
 *
 * On top of `fetch` it adds: base URL, an AbortController-based timeout,
 * propagation of the caller's cancellation signal, and normalisation of errors
 * into `ApiError`.
 *
 * @param {string} path Path relative to the API domain (e.g. `/api/product`).
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {unknown} [options.body] Serialised as JSON when provided.
 * @param {AbortSignal} [options.signal] Caller's signal (unmount, etc.).
 * @param {number} [options.timeoutMs]
 * @returns {Promise<unknown>}
 */
export async function request(
  path,
  { method = 'GET', body, signal, timeoutMs = REQUEST_TIMEOUT_MS } = {}
) {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('Timeout', 'TimeoutError'));
  }, timeoutMs);

  // If the caller cancels (for instance when unmounting the component), cancel
  // the in-flight request too.
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) abortFromCaller();
    else signal.addEventListener('abort', abortFromCaller, { once: true });
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    // A cancellation requested by the caller is not an application error: it is
    // rethrown as-is so the hook can ignore it.
    if (signal?.aborted) throw error;

    if (controller.signal.aborted) {
      throw new ApiError(
        'La petición ha tardado demasiado. El servidor puede estar arrancando; inténtalo de nuevo.',
        { url, kind: 'timeout', cause: error }
      );
    }

    throw new ApiError('No se ha podido conectar con el servidor.', {
      url,
      kind: 'network',
      cause: error,
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  if (!response.ok) {
    throw new ApiError(`La petición ha fallado con estado ${response.status}.`, {
      status: response.status,
      url,
      kind: 'http',
    });
  }

  // 204 and empty bodies are valid responses with no JSON.
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ApiError('La respuesta del servidor no es un JSON válido.', {
      status: response.status,
      url,
      kind: 'parse',
      cause: error,
    });
  }
}
