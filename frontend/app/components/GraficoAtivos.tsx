import * as React from "react"
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function GraficoAtivos({ historico }: { historico: any }) {
  const chartConfig = {
    patrimonio: {
      label: "Patrimônio Total",
      color: "#10b981"
    },
    investido: {
      label: "Total Investido",
      color: "#6b7280",
    },
  } satisfies ChartConfig
  if (!historico || historico.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-gray-400">
        Nenhum dado histórico disponível ainda.
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="mb-4 text-left">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Evolução Patrimonial
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Comparativo entre o total investido e o valor de mercado atual da sua carteira
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-65 max-h-90 w-full">
        <AreaChart
          accessibilityLayer
          data={historico}
          margin={{ top: 10, left: 12, right: 12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="data"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              const [ano, mes, dia] = value.split("-");
              return `${dia}/${mes}`;
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              new Intl.NumberFormat("pt-BR", {
                notation: "compact",
                compactDisplay: "short",
                style: "currency",
                currency: "BRL",
              }).format(value)
            }
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const label =
                    name === "patrimonio" ? "Patrimônio" : "Investido";
                  const formatted = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(value));
                  return (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">{label}:</span>
                      <span className="font-semibold">{formatted}</span>
                    </div>
                  );
                }}
              />
            }
          />
          {/* Área do Valor Investido */}
          <Area
            dataKey="investido"
            type="monotone"
            stroke="#6b7280"
            strokeDasharray="4 4"
            fill="url(#colorInvestido)"
            strokeWidth={1.5}
          />
          {/* Área do Valor de Mercado (Patrimônio) */}
          <Area
            dataKey="patrimonio"
            type="monotone"
            stroke="#10b981"
            fill="url(#colorPatrimonio)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}