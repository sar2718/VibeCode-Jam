import { useEffect, useMemo, useState } from "react";

export function useCountdown(targetIso?: string) {
  const targetTime = targetIso ? new Date(targetIso).getTime() : null;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetTime) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetTime]);

  return useMemo(() => {
    if (!targetTime) {
      return {
        totalMs: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
        label: "--:--:--"
      };
    }

    const totalMs = Math.max(0, targetTime - now);
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      totalMs,
      hours,
      minutes,
      seconds,
      isExpired: totalMs === 0,
      label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`
    };
  }, [now, targetTime]);
}
