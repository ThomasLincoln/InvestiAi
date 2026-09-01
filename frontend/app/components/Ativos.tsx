import type { Ativo } from '~/types';
import { TrendingUp, TrendingDown, Minus, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { useState, useMemo } from 'react';

const TIPO_BADGE: Record<string, { label: string; className: string }> = {
  'FII': { label: 'FII', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'Fundo Imobiliário': { label: 'FII', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'fundo imobiliário': { label: 'FII', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'Stock': { label: 'Stock', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'stock': { label: 'Stock', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'Ação': { label: 'Ação', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  'Acao': { label: 'Ação', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  'acao': { label: 'Ação', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  'ETF': { label: 'ETF', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'etf': { label: 'ETF', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

const CATEGORIAS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Ação', label: 'Ações' },
  { id: 'FII', label: 'FIIs' },
  { id: 'Stock', label: 'Stocks' },
  { id: 'ETF', label: 'ETFs' },
] as const;

type CategoriaId = typeof CATEGORIAS[number]['id'];

function TipoBadge({ tipo }: { tipo?: string }) {
  if (!tipo) return null;
  const config = TIPO_BADGE[tipo] ?? { label: tipo, className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function Ativos({
  items,
  loading = false,
  titulo,
  icon,
  showTabs = false,
}: {
  items: Ativo[];
  loading?: boolean;
  titulo?: React.ReactNode;
  icon?: React.ReactNode;
  showTabs?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<CategoriaId>('Todos');

  const contagemPorTipo = useMemo(() => {
    const counts: Record<string, number> = { Todos: items?.length || 0 };
    if (items) {
      items.forEach((item) => {
        const t = item.tipo || 'Outros';
        counts[t] = (counts[t] || 0) + 1;
      });
    }
    return counts;
  }, [items]);

  const itensFiltrados = useMemo(() => {
    if (!items) return [];
    if (!showTabs || activeTab === 'Todos') return items;
    return items.filter((item) => item.tipo === activeTab);
  }, [items, activeTab, showTabs]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl w-full bg-white dark:bg-gray-800 transition-colors">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2.5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl transition-colors">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-500 dark:text-violet-400 mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          {titulo ? `Nenhum investimento em ${titulo}` : 'Sua jornada começa aqui!'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5 text-center max-w-xs">
          Adicione seu primeiro investimento para começar a acompanhar seu patrimônio.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Abas opcionais por Categoria */}
      {showTabs && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
          {CATEGORIAS.map((cat) => {
            const count = contagemPorTipo[cat.id] || 0;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  if (!visible) setVisible(true);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 border border-gray-200/80 dark:border-gray-700'
                  }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Card Principal do Bloco */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors shadow-sm">
        {/* Cabeçalho do Bloco (Título + Ícone + Total + Botão de Recolher/Expandir) */}
        {(titulo || icon) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0">
                  {icon}
                </div>
              )}
              {titulo && (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {titulo}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                    {items.length}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setVisible(!visible)}
              title={visible ? 'Recolher tabela' : 'Expandir tabela'}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {visible ? <ChevronsDownUp size={18} /> : <ChevronsUpDown size={18} />}
            </button>
          </div>
        )}

        {/* Tabela de Ativos */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                <th className="w-[30%] text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ativo
                </th>
                <th className="w-[10%] text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qtd.
                </th>
                <th className="w-[15%] hidden sm:table-cell text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Preço Médio
                </th>
                <th className="w-[15%] hidden md:table-cell text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Preço Atual
                </th>
                <th className="w-[15%] hidden md:table-cell text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Variação
                </th>
                <th className="w-[15%] text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Saldo
                </th>
                {!titulo && !icon && (
                  <th className="w-[5%] text-right px-3 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => setVisible(!visible)}
                      title={visible ? 'Recolher tabela' : 'Expandir tabela'}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {visible ? <ChevronsDownUp size={18} /> : <ChevronsUpDown size={18} />}
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            {visible && (
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={titulo || icon ? 6 : 7} className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                      Nenhum ativo cadastrado nesta categoria.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((item) => {
                    const variacao = item.variacao_percentual || 0;

                    const isPositiva = variacao > 0;
                    const isNegativa = variacao < 0;
                    const isNeutro = variacao === 0;

                    const formataMoeda = (valor: number) =>
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

                    return (
                      <tr
                        key={item.id}
                        className="group hover:bg-violet-50/40 dark:hover:bg-violet-900/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-xs font-bold shrink-0">
                              {item.ticker?.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {item.ticker}
                                </p>
                                <TipoBadge tipo={item.tipo} />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">
                                {item.nome}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white tabular-nums">
                            {item.quantidade ?? '—'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-5 py-4 text-right">
                          <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">
                            {item.preco_medio ? formataMoeda(item.preco_medio) : '-'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-5 py-4 text-right">
                          <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">
                            {item.preco ? formataMoeda(item.preco) : '-'}
                          </span>
                        </td>

                        <td className="hidden md:table-cell px-5 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isPositiva
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : isNegativa
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                              }`}
                          >
                            {isPositiva && <TrendingUp size={12} />}
                            {isNegativa && <TrendingDown size={12} />}
                            {isNeutro && <Minus size={12} />}

                            {Math.abs(variacao).toFixed(2).replace('.', ',')}%
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                            {item.saldo ? formataMoeda(item.saldo) : '—'}
                          </span>
                        </td>
                        {!titulo && !icon && <td className="px-3 py-4 text-right"></td>}
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

