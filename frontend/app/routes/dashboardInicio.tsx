import PatrimonioTotal from "~/components/PatrimonioTotal";
import { useOutletContext } from "react-router";
import { TrendingUp, PieChart, ArrowUpRight } from "lucide-react";
import type { User } from "~/types";

export default function DashboardInicio() {
    const { user } = useOutletContext<{ user: User }>() || {};

    const mudanca = {
        crescimento: true,
        porcentagem: 3.4,
    };

    const primeiroNome = user?.fullname?.split(" ")[0] ?? "Investidor";

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white select-none">
                    Olá, {primeiroNome}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 select-none">
                    Aqui está o resumo dos seus investimentos
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 ">
                <PatrimonioTotal valorTotal={user?.saldo ?? 0} mudanca={mudanca} />

                <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                        <PieChart size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
                            Ativos na Carteira
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</h2>
                    </div>
                </div>

                <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ArrowUpRight size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
                            Rentabilidade Mensal
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</h2>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-10 flex flex-col items-center justify-center text-center transition-colors">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-500 dark:text-violet-400 mb-4">
                    <TrendingUp size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Gráficos em breve</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Acompanhe a evolução da sua carteira visualmente</p>
            </div>
        </div>
    );
}
