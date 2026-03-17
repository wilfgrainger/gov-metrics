"use client";

import { useEffect, useState } from "react";

interface ClientOnlyChartProps {
  children: React.ReactNode;
  heightClass: string;
}

export default function ClientOnlyChart({
  children,
  heightClass,
}: ClientOnlyChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  return (
    <div className={`chart-shell min-w-0 ${heightClass}`}>
      {mounted ? (
        children
      ) : (
        <div className="flex h-full items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 font-mono text-[10px] uppercase tracking-widest text-gray-400">
          Loading chart
        </div>
      )}
    </div>
  );
}
