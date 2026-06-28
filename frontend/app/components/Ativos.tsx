import type { Ativo } from "~/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Ativos({ items }: { items: Ativo[] }) {
    console.log("items que chegaram para o componente de ativos: ", items)
    if (!items || items.length === 0) {
        return (
            <div className="mt-8 flex flex-col items-center justify-center py-16 px-6
                rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-500 dark:text-violet-400 mb-4">
                    <TrendingUp size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Nenhum ativo na carteira</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adicione seu primeiro investimento para começar</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Ativo
                            </th>
                            <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Qtd.
                            </th>
                            <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Preço Médio
                            </th>
                            <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Preço Atual
                            </th>
                            <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Variação
                            </th>
                            <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Saldo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-violet-50/40 dark:hover:bg-violet-900/20 transition-colors">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-9 h-9
                                            rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400
                                            text-xs font-bold shrink-0">
                                            {item.ticker?.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.ticker}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">{item.nome}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.quantidade ?? '—'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                        -
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                        {item.preco ?? '-'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                        <Minus size={12} />
                                        0,00%
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 px-1">
                {items.length} {items.length === 1 ? 'ativo' : 'ativos'} na carteira
            </p>
        </div>
    );
}
