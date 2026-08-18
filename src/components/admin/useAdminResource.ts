'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Fetches a JSON resource for an admin screen.
 *
 * Three things this gets right that six hand-rolled copies did not:
 *
 *  - No synchronous setState inside the effect body. State is only written from
 *    promise callbacks, so mounting never cascades an extra render.
 *  - Responses are cancelled on unmount and on re-fetch, so a slow first request
 *    cannot land after a faster second one and overwrite newer data. That race
 *    is real whenever a filter changes quickly.
 *  - `reload()` bumps a token rather than re-invoking a callback, which keeps
 *    the effect the single place that performs the request.
 */
export type ResourceStatus = 'loading' | 'ready' | 'error';

/**
 * @param url Pass null when the request is not yet valid (for example a custom
 *   date range with only one date chosen). The hook then holds whatever it has
 *   rather than firing a request it knows will fail.
 */
export function useAdminResource<T>(url: string | null, fallbackMessage: string) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (!url) return;
    let active = true;

    fetch(url, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? fallbackMessage);
        }
        return (await response.json()) as T;
      })
      .then((result) => {
        if (!active) return;
        setData(result);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMessage(error instanceof Error && error.message ? error.message : fallbackMessage);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [url, fallbackMessage, token]);

  const reload = useCallback(() => setToken((value) => value + 1), []);

  /** Surfaces a failure from a mutation (delete, save) in the same error slot. */
  const fail = useCallback((text: string) => {
    setMessage(text);
    setStatus('error');
  }, []);

  return { data, status, message, reload, fail };
}
