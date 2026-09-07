/**
 * Safe JSON fetching helper to prevent "JSON.parse: unexpected character" errors
 * when endpoints return non-JSON, HTML error pages, or drop connection.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; ok: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return {
        data: null,
        error: `Server responded with ${res.status} (${contentType || 'non-json'})`,
        ok: false,
      };
    }

    const data = await res.json();
    return {
      data,
      error: res.ok ? null : (data?.error || `Request failed with status ${res.status}`),
      ok: res.ok,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Network connection failed',
      ok: false,
    };
  }
}
