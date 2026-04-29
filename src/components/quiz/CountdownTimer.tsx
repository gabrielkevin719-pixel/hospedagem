import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function CountdownTimer({ minutes = 10 }: { minutes?: number }) {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    if (seconds <= 0) return;
    const i = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(i);
  }, [seconds]);

  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive font-bold">
      <Clock className="w-5 h-5" />
      <span className="text-sm">Oferta expira em:</span>
      <span className="text-lg tabular-nums">{m}:{s}</span>
    </div>
  );
}
