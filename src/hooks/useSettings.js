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
  for (const cacheKey of Array.from(SETTINGS_CACHE.keys())) {
    const isSettingsKey = cacheKey.startsWith("settings:") || cacheKey.startsWith("settings:v2:");
    if (!key) {
      if (isSettingsKey) {
        SETTINGS_CACHE.delete(cacheKey);
      }
      continue;
    }

    if (isSettingsKey && cacheKey === key) {
      SETTINGS_CACHE.delete(cacheKey);
    }
  }
};

export const fetchCachedSettings = async (key, requestFn, ttl = DEFAULT_TTL) => {
  const cachedValue = getCachedSettings(key);
  if (Array.isArray(cachedValue) && cachedValue.length > 0) {
    return { data: { data: cachedValue } };
  }

  const response = await requestFn();
  const payload = response?.data?.data ?? response?.data ?? [];
  setCachedSettings(key, payload, ttl);
  return response;
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
