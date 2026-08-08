import * as React from "react"
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

export default function GraficoAtivos({ historico }: { historico: any }) {
  const chartConfig = {
    investido: {
      label: "Valor Aplicado",
      color: "#2563eb",
    },
  } satisfies ChartConfig
  console.log(historico)
  return (
    <ChartContainer config={chartConfig} className="min-h-50 max-h-100 w-full">
      <AreaChart accessibilityLayer data={historico} margin={{
        left: 12,
        right: 12,
      }}>
        <CartesianGrid />
        <XAxis
          dataKey="data"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />} />
        <Area
          dataKey="investido"
          type="linear"
          fill="var(--color-investido)"
          stroke="var(--color-investido)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
