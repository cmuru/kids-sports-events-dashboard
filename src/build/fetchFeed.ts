const TIMEOUT_MS = 15_000;
const USER_AGENT = 'KidsSportsDashboard/1.0 (family calendar viewer)';

export async function fetchFeed(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`);
    }

    return await res.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Timeout after ${TIMEOUT_MS / 1000}s fetching ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
