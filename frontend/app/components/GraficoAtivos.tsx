import * as React from "react";
import { useState, useMemo } from "react";
import { ChartContainer, type ChartConfig, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

type Periodo = "1M" | "3M" | "6M" | "1Y" | "ALL";

export default function GraficoAtivos({ historico }: { historico: any[] }) {
  const [periodo, setPeriodo] = useState<Periodo>("ALL");

  const chartConfig = {
    patrimonio: {
      label: "Patrimônio Total",
      color: "#10b981",
    },
    investido: {
      label: "Total Investido",
      color: "#6b7280",
    },
  } satisfies ChartConfig;

  // Filtragem dos dados de acordo com o período selecionado
  const dadosFiltrados = useMemo(() => {
    if (!historico || historico.length === 0) return [];
    if (periodo === "ALL") return historico;

    const ultimaDataStr = historico[historico.length - 1]?.data;
    if (!ultimaDataStr) return historico;

    const [uAno, uMes, uDia] = ultimaDataStr.split("-").map(Number);
    const ultimaData = new Date(uAno, uMes - 1, uDia);
    const dataCorte = new Date(ultimaData);

    if (periodo === "1M") dataCorte.setMonth(dataCorte.getMonth() - 1);
    if (periodo === "3M") dataCorte.setMonth(dataCorte.getMonth() - 3);
    if (periodo === "6M") dataCorte.setMonth(dataCorte.getMonth() - 6);
    if (periodo === "1Y") dataCorte.setFullYear(dataCorte.getFullYear() - 1);

    const filtrados = historico.filter((item) => {
      if (!item.data) return false;
      const [a, m, d] = item.data.split("-").map(Number);
      const dataItem = new Date(a, m - 1, d);
      return dataItem >= dataCorte;
    });

    return filtrados.length > 0 ? filtrados : historico;
  }, [historico, periodo]);

  if (!historico || historico.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-gray-400">
        Nenhum dado histórico disponível ainda.
      </div>
    );
  }

  const botoesPeriodo: { key: Periodo; label: string }[] = [
    { key: "1M", label: "1M" },
    { key: "3M", label: "3M" },
    { key: "6M", label: "6M" },
    { key: "1Y", label: "1A" },
    { key: "ALL", label: "Tudo" },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Evolução Patrimonial
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Comparativo entre o total investido e o valor de mercado atual da sua carteira
          </p>
        </div>

        {/* Botões de Seleção de Período */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          {botoesPeriodo.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setPeriodo(btn.key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${periodo === btn.key
                ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="min-h-65 max-h-90 w-full">
        <AreaChart
          accessibilityLayer
          data={dadosFiltrados}
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
            tickMargin={10}
            minTickGap={45}
            tickFormatter={(value) => {
              if (!value) return "";
              const [ano, mes, dia] = value.split("-");
              if (!dia || !mes) return value;

              if (periodo === "ALL" || periodo === "1Y" || periodo === "6M") {
                const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                const idxMes = parseInt(mes, 10) - 1;
                const nomeMes = meses[idxMes] || mes;
                return `${nomeMes}/${ano?.slice(2)}`;
              }
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
                labelFormatter={(value) => {
                  if (!value) return "";
                  const [ano, mes, dia] = value.split("-").map(Number);
                  if (!dia || !mes || !ano) return value;
                  const dataObj = new Date(ano, mes - 1, dia);
                  return dataObj.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });
                }}
                formatter={(value, name) => {
                  const label = name === "patrimonio" ? "Patrimônio" : "Investido";
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