import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface Mudanca {
    crescimento?: boolean,
    porcentagem: number,
}

interface PatrimonioProps {
    valorTotal: number;
    mudanca: Mudanca;
}

export default function PatrimonioTotal({ valorTotal, mudanca }: PatrimonioProps) {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valorTotal);

    const positivo = mudanca.crescimento !== false;

    return (
        <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0">
                <Wallet size={22} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
                    Patrimônio Total
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {valorFormatado}
                </h2>
            </div>
            <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                ${positivo
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }
            `}>
                {positivo ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {mudanca.porcentagem}%
            </div>
        </div>
    );
}
