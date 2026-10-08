"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { useId } from "react";
import type { PricePoint } from "@/lib/api";

type SparklineProps = {
  data: PricePoint[];
};

export default function Sparkline({ data }: SparklineProps) {
  const chartId = useId().replace(/:/g, "");

  if (data.length < 2) {
    return (
      <div className="flex h-10 w-28 items-center justify-end text-xs text-neutral-600">
        No chart data
      </div>
    );
  }

  const isPositive = data.at(-1)!.price >= data[0]!.price;
  const stroke = isPositive ? "#22c55e" : "#ef4444";
  const chartData = data.map(({ recordedAt, price }) => ({ recordedAt, price }));
  const gradientId = `spark-${chartId}`;

  return (
    <div className="h-10 w-28" aria-label="Intraday price trend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={stroke}
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor={stroke}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
