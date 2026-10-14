"use client";

import { useEffect, useState } from "react";

/** Live countdown to an event. Renders dashes first so server and browser agree. */
export default function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const targetMs = new Date(target).getTime();
  if (Number.isNaN(targetMs)) return null;

  const remaining = now === null ? null : Math.max(0, targetMs - now);

  if (remaining === 0) {
    return (
      <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
        This event has started.
      </p>
    );
  }

  const totalSeconds = remaining === null ? null : Math.floor(remaining / 1000);
  const units = [
    { label: "Days", value: totalSeconds === null ? null : Math.floor(totalSeconds / 86400) },
    { label: "Hours", value: totalSeconds === null ? null : Math.floor((totalSeconds % 86400) / 3600) },
    { label: "Min", value: totalSeconds === null ? null : Math.floor((totalSeconds % 3600) / 60) },
    { label: "Sec", value: totalSeconds === null ? null : totalSeconds % 60 },
  ];

  return (
    <div role="timer" aria-label="Time until the event starts" className="grid grid-cols-4 gap-2 sm:gap-3">
      {units.map((unit) => (
        <div key={unit.label} className="rounded-xl bg-primary px-2 py-3 text-center text-white shadow-sm">
          <div className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
            {unit.value === null ? "--" : String(unit.value).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}