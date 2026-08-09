import PatrimonioTotal from '~/components/PatrimonioTotal';
import AddInvestimento from '~/components/AddInvestimentoComponent';
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { useOutletContext, useLoaderData, useRevalidator } from 'react-router';
import { PieChart, ArrowUpRight } from 'lucide-react';
import type { User, TransacaoBackend, HistoricoAtivo } from '~/types';
import Ativos from '~/components/Ativos';
import GraficoAtivos from '~/components/GraficoAtivos';


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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const [ativosRes, carteiraRes, historicoAtivos] = await Promise.all([
    fetch(`${env.VITE_API_URL}/ativos/`),
    fetch(`${env.VITE_API_URL}/usuario/ativosAgrupados`, {
      headers: {
        Authorization: session ? `Bearer ${session.access_token}` : '',
        'Content-Type': 'application/json',
      },
    }),
    fetch(`${env.VITE_API_URL}/usuario/obterHistorico`, {
      headers: {
        Authorization: session ? `Bearer ${session.access_token}` : '',
        'Content-Type': 'application/json',
      },
    })
  ])


  const ativos = await ativosRes.json();
  const ativosNaCarteira = await carteiraRes.json();
  const historico = await historicoAtivos.json();
  let dadosTransformados = [];
  if (ativosNaCarteira && Array.isArray(ativosNaCarteira)) {
    dadosTransformados = ativosNaCarteira.map((item: TransacaoBackend) => {
      return {
        id: item.ID,
        ticker: item.Ativo.ticker,
        nome: item.Ativo.nome,
        quantidade: item.Quantidade,
        preco_medio: item.preco_medio,
        preco: item.preco
      };
    });
  } else {
    console.error("A resposta da API para carteira não é um array:", ativosNaCarteira);
  }
  let saldoAcumulado = 0;
  let chartData = [];
  if (historico && Array.isArray(historico)) {
    chartData = historico.map((item) => {
      const totalGastoNoDia = item.transacoes.reduce((acc: number, transacao: any) => {
        return acc + (transacao.quantidade * transacao.preco_unitario);
      }, 0);

      saldoAcumulado += totalGastoNoDia;

      return {
        data: item.data,
        investido: saldoAcumulado,
      };
    });
  } else {
    console.error("A resposta da API para histórico não é um array:", historico);
  }
  const loading = false;

  return { env, ativos, carteira: dadosTransformados, supabase, loading, historico: chartData }
}

export default function DashboardInicio() {
  const { user } = useOutletContext<{ user: User }>() || {};
  let loading = true;
  const { ativos, carteira = [], supabase, newLoading, historico } = useLoaderData();
  const revalidator = useRevalidator();
  const mudanca = {
    crescimento: true,
    porcentagem: 3.4,
  };
  const primeiroNome = user?.fullname?.split(' ')[0] ?? 'Investidor';

  loading = newLoading;
  const patrimonioTotalValue = (carteira as unknown[]).reduce((n: number, item: any) => {
    return n + (Number(item.preco_medio) * Number(item.quantidade));
  }, 0);
  const quantidadeAtivos = (carteira as unknown[]).length;


  return (
    <div>
      <div className="mb-8">
        <div className='flex justify-between'>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white select-none">
              Olá, {primeiroNome}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 select-none">
              Aqui está o resumo dos seus investimentos
            </p>
          </div>
          <div>
            <AddInvestimento items={ativos} supabase={supabase} onAporteSucesso={() => revalidator.revalidate()} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 ">
        <PatrimonioTotal valorTotal={patrimonioTotalValue} mudanca={mudanca} />

        <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
            <PieChart size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
              Ativos na Carteira
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{quantidadeAtivos}</h2>
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

      <div className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-10 flex flex-col items-center justify-center text-center transition-colors">
        <GraficoAtivos historico={historico} />
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center transition-colors">
        <Ativos items={carteira} loading={loading} />
      </div>
    </div>
  );
}
