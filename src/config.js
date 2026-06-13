const isLocalRuntime = (() => {
  if (typeof window === 'undefined') {
    return false;
  }

  const localHosts = new Set(['', 'localhost', '127.0.0.1', '0.0.0.0', '::1']);
  return localHosts.has(window.location.hostname);
})();

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalRuntime ? 'http://localhost:8100/api' : '/api');
