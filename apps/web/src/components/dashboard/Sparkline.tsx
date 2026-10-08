"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

type SparklineProps = {
  data: number[];
  positive?: boolean;
};

export default function Sparkline({
  data,
  positive = true,
}: SparklineProps) {
  if (data.length < 2) {
    return (
      <div className="h-10 w-28 flex items-center">
        <div className="h-px w-full bg-white/15" />
      </div>
    );
  }

  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  const stroke = positive ? "#22c55e" : "#ef4444";

  return (
    <div className="h-10 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id={`spark-${positive ? "positive" : "negative"}`}
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
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#spark-${
              positive ? "positive" : "negative"
            })`}
            dot={false}
            isAnimationActive
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}