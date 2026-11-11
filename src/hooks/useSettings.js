import { useCallback, useEffect, useState } from "react";

const SETTINGS_CACHE = new Map();
const DEFAULT_TTL = 60 * 60 * 1000;

export const getCachedSettings = (key, fallback = []) => {
  const cached = SETTINGS_CACHE.get(key);
  if (!cached) return fallback;

  if (Date.now() > cached.expiresAt) {
    SETTINGS_CACHE.delete(key);
    return fallback;
  }

  return cached.value;
};

export const setCachedSettings = (key, value, ttl = DEFAULT_TTL) => {
  SETTINGS_CACHE.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });

  return value;
};

export const invalidateSettingsCache = (key) => {
  SETTINGS_CACHE.delete(key);
};

export const fetchCachedSettings = async (key, requestFn, ttl = DEFAULT_TTL) => {
  const cachedValue = getCachedSettings(key);
  if (cachedValue && cachedValue.length !== undefined) {
    return cachedValue;
  }

  const response = await requestFn();
  const payload = response?.data?.data ?? response?.data ?? [];
  return setCachedSettings(key, payload, ttl);
};

export const useSettings = (key, requestFn, ttl = DEFAULT_TTL) => {
  const [data, setData] = useState(() => getCachedSettings(key, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(
    async (force = false) => {
      if (!requestFn) {
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const cached = force ? null : getCachedSettings(key);
        if (cached && cached.length !== undefined) {
          setData(cached);
          setLoading(false);
          return cached;
        }

        const response = await requestFn();
        const payload = response?.data?.data ?? response?.data ?? [];
        setData(setCachedSettings(key, payload, ttl));
        return payload;
      } catch (err) {
        setError(err);
        return getCachedSettings(key, []);
      } finally {
        setLoading(false);
      }
    },
    [key, requestFn, ttl],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

export default useSettings;
