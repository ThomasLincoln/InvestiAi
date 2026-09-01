/* eslint-disable @typescript-eslint/no-explicit-any */
import PatrimonioTotal from '~/components/PatrimonioTotal';
import AddInvestimento from '~/components/AddInvestimentoComponent';
import { createServerClient, parseCookieHeader, serializeCookieHeader, createBrowserClient } from '@supabase/ssr';
import { useOutletContext, useLoaderData, useRevalidator } from 'react-router';
import { useMemo, lazy, Suspense, useState } from 'react';
import { PieChart, ArrowUpRight } from 'lucide-react';
import type { User, TransacaoBackend } from '~/types';
import Ativos from '~/components/Ativos';
import { motion } from 'framer-motion';

// Carregamento lazy do gráfico (recharts é pesado, ~200KB)
const GraficoAtivos = lazy(() => import('~/components/GraficoAtivos'));

export async function loader({ request }: { request: Request }) {
  const env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    VITE_API_URL: process.env.VITE_API_URL || '',
  }

  const headers = new Headers()

  const supabase = createServerClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
          return cookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value ?? '',
          }));
        },

        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      }
    }
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let ativosRes, carteiraRes, historicoRes;
  try {
    [ativosRes, carteiraRes, historicoRes] = await Promise.all([
      fetch(`${env.VITE_API_URL}/ativos/`),
      fetch(`${env.VITE_API_URL}/usuario/ativosAgrupados`, {
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${env.VITE_API_URL}/usuario/historico_patrimonio`, {
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      })
    ]);
  } catch (error) {
    console.error("Falha ao se conectar com a API do Backend:", error);
    ativosRes = { ok: false } as unknown as Response;
    carteiraRes = { ok: false } as unknown as Response;
    historicoRes = { ok: false } as unknown as Response;
  }



  const ativos = ativosRes.ok ? await ativosRes.json() : [];
  const ativosNaCarteira = carteiraRes.ok ? await carteiraRes.json() : [];
  const historico = historicoRes.ok ? await historicoRes.json() : [];
  let dadosTransformados: { id: number; ticker: string; nome: string; quantidade: number; preco_medio: number | undefined; preco: number | undefined; }[] = [];
  if (ativosNaCarteira && Array.isArray(ativosNaCarteira)) {
    dadosTransformados = ativosNaCarteira.map((item: TransacaoBackend) => {
      const precoAtual = item.preco || 0;
      const precoMedio = item.preco_medio || 0;
      const quantidade = item.Quantidade || 0;
      const variacaoReais = precoAtual > 0 ? precoAtual - precoMedio : 0;
      const variacaoPercentual = (precoAtual > 0 && precoMedio > 0)
        ? ((precoAtual - precoMedio) / precoMedio) * 100
        : 0;
      const precoEfetivo = precoAtual > 0 ? precoAtual : precoMedio;
      const saldoTotal = quantidade * precoEfetivo;
      return {
        id: item.ID,
        ticker: item.Ativo.ticker,
        nome: item.Ativo.nome,
        quantidade: quantidade,
        preco_medio: precoMedio,
        preco: precoAtual,
        variacao_reais: variacaoReais,
        variacao_percentual: Number(variacaoPercentual.toFixed(2)),
        saldo: saldoTotal,
      };
    });
  } else {
    console.error("A resposta da API para carteira não é um array:", ativosNaCarteira);
  }
  let chartData: { data: string; investido: number; patrimonio: number; ganho: number }[] = [];
  if (Array.isArray(historico)) {
    chartData = historico.map((item) => ({
      data: item.data,
      investido: item.valor_aplicado,
      patrimonio: item.valor_mercado,
      ganho: item.ganho_capital,
    }));
  }
  const loading = false;

  return { env, ativos, carteira: dadosTransformados, loading, historico: chartData }
}

export default function DashboardInicio() {
  const { user } = useOutletContext<{ user: User }>() || {};
  const { env, ativos, carteira = [], newLoading, historico } = useLoaderData();
  const revalidator = useRevalidator();

  const loading = newLoading ?? false;
  const primeiroNome = user?.fullname?.split(' ')[0] ?? 'Investidor';

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const { patrimonioTotalValue, mudanca } = useMemo(() => {
    let totalInvestido = 0;
    let totalAtual = 0;

    (carteira as any[]).forEach((item) => {
      const qtd = Number(item.quantidade) || 0;
      const pMedio = Number(item.preco_medio) || 0;
      const pAtual = Number(item.preco) > 0 ? Number(item.preco) : pMedio;

      totalInvestido += pMedio * qtd;
      totalAtual += pAtual * qtd;
    });

    const variacaoPct = totalInvestido > 0
      ? ((totalAtual - totalInvestido) / totalInvestido) * 100
      : 0;

    return {
      patrimonioTotalValue: totalAtual,
      mudanca: {
        crescimento: variacaoPct >= 0,
        porcentagem: Number(Math.abs(variacaoPct).toFixed(2)),
      },
    };
  }, [carteira]);

  const quantidadeAtivos = (carteira as unknown[]).length;

  const supabase = useMemo(() => createBrowserClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_PUBLISHABLE_KEY
  ), [env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY]);

  const handleRecalcular = async () => {
    if (isRecalculating) return;
    setIsRecalculating(true);
    setRecalcMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${env.VITE_API_URL}/usuario/recalcular_patrimonio`, {
        method: 'POST',
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setRecalcMsg({ tipo: 'ok', texto: 'Patrimônio atualizado! 🎉' });
        revalidator.revalidate();
      } else {
        const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
        setRecalcMsg({ tipo: 'erro', texto: err.detail ?? 'Erro ao recalcular.' });
      }
    } catch {
      setRecalcMsg({ tipo: 'erro', texto: 'Falha ao conectar com o servidor.' });
    } finally {
      setIsRecalculating(false);
      setTimeout(() => setRecalcMsg(null), 6000);
    }
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className='flex justify-between items-start gap-3'>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white select-none">
              Olá, {primeiroNome} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 select-none">
              Aqui está o resumo dos seus investimentos
            </p>
            {/* Toast de feedback do recálculo */}
            {recalcMsg && (
              <p className={`text-xs mt-2 font-medium ${recalcMsg.tipo === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {recalcMsg.texto}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Botão Atualizar Cotações */}
            <button
              onClick={handleRecalcular}
              disabled={isRecalculating}
              title="Atualizar cotações e recalcular patrimônio"
              className="relative group overflow-hidden flex items-center justify-center gap-2 px-4 py-2.5
                          text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700
                          text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800
                          hover:bg-gray-50 dark:hover:bg-gray-700
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-200 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16" height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isRecalculating ? 'animate-spin' : ''}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              <span className="hidden sm:inline">
                {isRecalculating ? 'Atualizando...' : 'Atualizar cotações'}
              </span>
            </button>
            <AddInvestimento items={ativos} supabase={supabase} onAporteSucesso={() => revalidator.revalidate()} />
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <PatrimonioTotal valorTotal={patrimonioTotalValue} mudanca={mudanca} />
        </motion.div>

        <motion.div variants={itemVariants}
          className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                     hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 ease-out"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shrink-0 shadow-md shadow-blue-500/30">
            <PieChart size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
              Ativos na Carteira
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">{quantidadeAtivos}</h2>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}
          className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                     hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 ease-out"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shrink-0 shadow-md shadow-emerald-500/30">
            <ArrowUpRight size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
              Rentabilidade Mensal
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</h2>
          </div>
        </motion.div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants}
        className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-10 flex flex-col items-center justify-center text-center transition-colors"
      >
        <Suspense fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <div className="h-full w-full rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        }>
          <GraficoAtivos historico={historico} />
        </Suspense>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center transition-colors"
      >
        <Ativos items={carteira} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
