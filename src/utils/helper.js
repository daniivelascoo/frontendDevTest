const DEFAULT_TTL = 60 * 60 * 1000; // 1 hora

/*
  Se ha decidido no utilizar TanStack Query para evitar añadir complejidad innecesaria
  en una aplicación pequeña. En su lugar, se implementa un sistema de caché en cliente
  mediante localStorage con expiración (TTL), cumpliendo así el requisito de cachear
  los datos durante 1 hora de forma simple, explícita y mantenible.

  En caso de una aplicación mas grande si que se optaría por una opción más robusta como
  sería TanStack Query.
*/
export const storageCache = {
  set(key, value, ttl = DEFAULT_TTL) {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };

    localStorage.setItem(key, JSON.stringify(item));
  },

  get(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);

      // En caso de no tener formato correcto se limpia el local storage
      if (!item?.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      // Ha expirado la cache
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },
};