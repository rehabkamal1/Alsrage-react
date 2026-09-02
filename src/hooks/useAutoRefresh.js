import { useEffect, useRef } from "react";

/**
 * Custom hook to perform silent auto-refresh and window focus refetching
 * @param {Function} callback - Function to trigger for refreshing data silently
 * @param {number} intervalMs - Interval in milliseconds (default: 12000ms = 12s)
 * @param {boolean} enabled - Whether polling is active (default: true)
 */
export const useAutoRefresh = (callback, intervalMs = 12000, enabled = true) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Silent fetcher without showing global loading spinners
    const triggerFetch = () => {
      if (document.visibilityState === "visible" && savedCallback.current) {
        savedCallback.current(true); // pass isSilent = true
      }
    };

    // 1. Setup periodic polling
    const timerId = setInterval(triggerFetch, intervalMs);

    // 2. Setup window focus & visibility change listener
    const handleFocus = () => {
      triggerFetch();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(timerId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [intervalMs, enabled]);
};

export default useAutoRefresh;
