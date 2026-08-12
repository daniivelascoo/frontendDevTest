import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config.js';

/**
 * Error de red o de API con contexto suficiente para que la UI decida qué
 * mensaje mostrar sin tener que inspeccionar strings.
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {object} [details]
   * @param {number} [details.status] Código HTTP, si hubo respuesta.
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

  /** El recurso no existe (404): la UI lo trata como "producto no encontrado". */
  get isNotFound() {
    return this.status === 404;
  }

  /** Reintentar tiene sentido en fallos de red, timeout o errores 5xx. */
  get isRetryable() {
    return this.kind === 'network' || this.kind === 'timeout' || (this.status ?? 0) >= 500;
  }
}

/**
 * Realiza una petición al API y devuelve el JSON ya parseado.
 *
 * Añade sobre `fetch`: URL base, timeout por AbortController, propagación de
 * la señal de cancelación del llamante y normalización de errores a `ApiError`.
 *
 * @param {string} path Ruta relativa al dominio del API (p. ej. `/api/product`).
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {unknown} [options.body] Se serializa como JSON si se proporciona.
 * @param {AbortSignal} [options.signal] Señal del llamante (desmontaje, etc.).
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

  // Si el llamante cancela (por ejemplo, al desmontar el componente),
  // cancelamos también la petición en curso.
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
    // Una cancelación pedida por el llamante no es un error de la aplicación:
    // se propaga tal cual para que el hook la ignore.
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

  // 204 y cuerpos vacíos son respuestas válidas sin JSON.
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
