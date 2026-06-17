import { clientEventBus } from '~/utils/eventBus';

export function useCommunicationClient() {
  const config = useRuntimeConfig();

  const base = config.public.communicationBaseUrl;

  async function request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Request failed: ${res.status}`);
    }

    return res.json().catch(() => null);
  }

  return {
    request,
    bus: clientEventBus
  };
}
