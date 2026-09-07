/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient, parseCookieHeader, serializeCookieHeader, createBrowserClient } from '@supabase/ssr';
import { useLoaderData, useRevalidator } from 'react-router';
import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Wallet,
  Calendar,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AddInvestimento from '~/components/AddInvestimentoComponent';
import type { Ativo, Movimentacao, TransacaoBackend } from '~/types';

export async function loader({ request }: { request: Request }) {
  const env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    VITE_API_URL: process.env.VITE_API_URL || '',
  };

  const headers = new Headers();

  const supabase = createServerClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
        return cookies.map((cookie) => ({
          name: cookie.name,
          value: cookie.value ?? '',
        }));
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let ativosRes, carteiraRes, transacoesRes;
  try {
    [ativosRes, carteiraRes, transacoesRes] = await Promise.all([
      fetch(`${env.VITE_API_URL}/ativos/`),
      fetch(`${env.VITE_API_URL}/usuario/ativosAgrupados`, {
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${env.VITE_API_URL}/usuario/transacoes`, {
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      }),
    ]);
  } catch (error) {
    console.error('Falha ao se conectar com a API do Backend:', error);
    ativosRes = { ok: false } as unknown as Response;
    carteiraRes = { ok: false } as unknown as Response;
    transacoesRes = { ok: false } as unknown as Response;
  }

  const ativos = ativosRes.ok ? await ativosRes.json() : [];
  const ativosNaCarteira = carteiraRes.ok ? await carteiraRes.json() : [];
  const transacoes: Movimentacao[] = transacoesRes.ok ? await transacoesRes.json() : [];

  // Transformação idêntica à do DashboardInicio para a variável carteira
  let carteira: Ativo[] = [];
  if (ativosNaCarteira && Array.isArray(ativosNaCarteira)) {
    carteira = ativosNaCarteira.map((item: TransacaoBackend) => {
      const precoAtual = item.preco || 0;
      const precoMedio = item.preco_medio || 0;
      const quantidade = item.Quantidade || 0;
      const variacaoReais = precoAtual > 0 ? precoAtual - precoMedio : 0;
      const variacaoPercentual =
        precoAtual > 0 && precoMedio > 0 ? ((precoAtual - precoMedio) / precoMedio) * 100 : 0;
      const precoEfetivo = precoAtual > 0 ? precoAtual : precoMedio;
      const saldoTotal = quantidade * precoEfetivo;
      return {
        id: String(item.ID),
        ticker: item.Ativo.ticker,
        nome: item.Ativo.nome,
        quantidade: quantidade,
        preco_medio: precoMedio,
        preco: precoAtual,
        variacao_reais: variacaoReais,
        variacao_percentual: Number(variacaoPercentual.toFixed(2)),
        tipo: item.Ativo.tipo,
        saldo: saldoTotal,
      };
    });
  }

  return { env, carteira, transacoes, ativos };
}

function TipoBadge({ tipo }: { tipo?: string }) {
  if (!tipo) return null;
  const s = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let label = tipo;
  let className = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';

  if (s.includes('fii') || s.includes('fundo') || s.includes('imobili')) {
    label = 'FII';
    className = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  } else if (s.includes('stock')) {
    label = 'Stock';
    className = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  } else if (s.includes('acao')) {
    label = 'Ação';
    className = 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
  } else if (s.includes('etf')) {
    label = 'ETF';
    className = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  }

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${className}`}>
      {label}
    </span>
  );
}

export default function Transacoes() {
  const { env, carteira = [], transacoes = [], ativos = [] } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const supabase = useMemo(
    () => createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY),
    [env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY]
  );

  // Armazena a carteira e transações em sessionStorage para persistência/cache rápido
  useEffect(() => {
    try {
      if (carteira && carteira.length > 0) {
        sessionStorage.setItem('investiai_carteira', JSON.stringify(carteira));
      }
      if (transacoes && transacoes.length > 0) {
        sessionStorage.setItem('investiai_transacoes', JSON.stringify(transacoes));
      }
    } catch {
      // Falha silenciosa em caso de restrições de storage do navegador
    }
  }, [carteira, transacoes]);

  // Estados de Filtro e Busca
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Ação' | 'FII' | 'Stock' | 'ETF'>('Todos');
  const [filtroOperacao, setFiltroOperacao] = useState<'Todas' | 'Compra' | 'Venda'>('Todas');

  // Estados de Ordenação
  const [campoOrdenacao, setCampoOrdenacao] = useState<'data' | 'tipo' | 'operacao' | 'ticker' | 'valor'>('data');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('desc');

  const handleAlternarOrdenacao = (campo: 'data' | 'tipo' | 'operacao' | 'ticker' | 'valor') => {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao(campo === 'data' || campo === 'valor' ? 'desc' : 'asc');
    }
  };

  // Estados e Ação de Exclusão
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const handleExcluirTransacao = async (id: number) => {
    setIsDeletingId(id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${env.VITE_API_URL}/usuario/transacoes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setToastMsg({ tipo: 'ok', texto: 'Transação excluída com sucesso! 🗑️' });
        setConfirmDeleteId(null);
        revalidator.revalidate();
      } else {
        const err = await res.json().catch(() => ({ detail: 'Erro ao excluir transação.' }));
        setToastMsg({ tipo: 'erro', texto: err.detail || 'Erro ao excluir transação.' });
      }
    } catch {
      setToastMsg({ tipo: 'erro', texto: 'Falha ao conectar com o servidor.' });
    } finally {
      setIsDeletingId(null);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  // Cálculos de Resumo (KPIs)
  const totalInvestido = useMemo(() => {
    return transacoes.reduce((acc, t) => {
      const isCompra = (t.tipo || '').toLowerCase().includes('compra');
      return isCompra ? acc + (t.valor_total || 0) : acc - (t.valor_total || 0);
    }, 0);
  }, [transacoes]);

  const saldoCarteira = useMemo(() => {
    return carteira.reduce((acc, a) => acc + (a.saldo || 0), 0);
  }, [carteira]);

  const formataMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formataData = (dataStr: string) => {
    if (!dataStr) return '—';
    try {
      const [ano, mes, dia] = dataStr.split('-');
      if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
      const d = new Date(dataStr);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return dataStr;
    }
  };

  const transacoesFiltradas = useMemo(() => {
    const filtradas = transacoes.filter((item) => {
      // Filtro de Busca (Ticker ou Nome)
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        item.ativo.ticker.toLowerCase().includes(termo) ||
        item.ativo.nome.toLowerCase().includes(termo);

      // Filtro por Operação (Compra / Venda)
      const op = (item.tipo || '').toLowerCase();
      const matchOperacao =
        filtroOperacao === 'Todas' ||
        (filtroOperacao === 'Compra' && op.includes('compra')) ||
        (filtroOperacao === 'Venda' && op.includes('venda'));

      // Filtro por Tipo de Ativo
      const t = (item.ativo.tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let matchTipo = true;
      if (filtroTipo === 'FII') {
        matchTipo = t.includes('fii') || t.includes('fundo') || t.includes('imobili');
      } else if (filtroTipo === 'Ação') {
        matchTipo = t.includes('acao');
      } else if (filtroTipo === 'Stock') {
        matchTipo = t.includes('stock');
      } else if (filtroTipo === 'ETF') {
        matchTipo = t.includes('etf');
      }

      return matchBusca && matchOperacao && matchTipo;
    });

    return [...filtradas].sort((a, b) => {
      if (campoOrdenacao === 'data') {
        const comp = direcaoOrdenacao === 'asc'
          ? a.data.localeCompare(b.data)
          : b.data.localeCompare(a.data);
        if (comp !== 0) return comp;
        return direcaoOrdenacao === 'asc' ? a.id - b.id : b.id - a.id;
      }
      if (campoOrdenacao === 'tipo') {
        // Normaliza o rótulo do tipo de ativo (Ação, ETF, FII, Stock)
        const getTipoLabel = (tipo?: string) => {
          if (!tipo) return 'Outros';
          const s = tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (s.includes('acao')) return 'Ação';
          if (s.includes('etf')) return 'ETF';
          if (s.includes('fii') || s.includes('fundo') || s.includes('imobili')) return 'FII';
          if (s.includes('stock')) return 'Stock';
          return tipo;
        };
        const tipoA = getTipoLabel(a.ativo.tipo);
        const tipoB = getTipoLabel(b.ativo.tipo);
        const compTipo = direcaoOrdenacao === 'asc'
          ? tipoA.localeCompare(tipoB)
          : tipoB.localeCompare(tipoA);
        if (compTipo !== 0) return compTipo;

        // Desempate pelo ticker e depois por data mais recente
        const compTicker = (a.ativo.ticker || '').localeCompare(b.ativo.ticker || '');
        if (compTicker !== 0) return compTicker;
        return b.data.localeCompare(a.data);
      }
      if (campoOrdenacao === 'operacao') {
        const opA = (a.tipo || 'Compra').toLowerCase();
        const opB = (b.tipo || 'Compra').toLowerCase();
        const compOp = direcaoOrdenacao === 'asc'
          ? opA.localeCompare(opB)
          : opB.localeCompare(opA);
        if (compOp !== 0) return compOp;
        return b.data.localeCompare(a.data);
      }
      if (campoOrdenacao === 'ticker') {
        const tickA = (a.ativo.ticker || '').toLowerCase();
        const tickB = (b.ativo.ticker || '').toLowerCase();
        const compTick = direcaoOrdenacao === 'asc'
          ? tickA.localeCompare(tickB)
          : tickB.localeCompare(tickA);
        if (compTick !== 0) return compTick;
        return b.data.localeCompare(a.data);
      }
      if (campoOrdenacao === 'valor') {
        const valA = a.valor_total || 0;
        const valB = b.valor_total || 0;
        const compValor = direcaoOrdenacao === 'asc' ? valA - valB : valB - valA;
        if (compValor !== 0) return compValor;
        return b.data.localeCompare(a.data);
      }
      return 0;
    });
  }, [transacoes, busca, filtroTipo, filtroOperacao, campoOrdenacao, direcaoOrdenacao]);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                <Receipt size={22} />
              </span>
              <span>Histórico de Transações</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Registro completo de todas as suas compras, vendas e aportes realizados
            </p>
            {toastMsg && (
              <p
                className={`text-xs mt-2 font-medium ${toastMsg.tipo === 'ok'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
                  }`}
              >
                {toastMsg.texto}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AddInvestimento
              items={ativos}
              carteira={carteira}
              supabase={supabase}
              onAporteSucesso={() => revalidator.revalidate()}
            />
          </div>
        </div>
      </motion.div>

      {/* KPI Cards de Resumo */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shrink-0 shadow-md shadow-violet-500/20">
            <Receipt size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total de Operações
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">
              {transacoes.length}
            </h2>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shrink-0 shadow-md shadow-emerald-500/20">
            <ArrowDownLeft size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Aportado
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums truncate">
              {formataMoeda(totalInvestido)}
            </h2>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shrink-0 shadow-md shadow-blue-500/20">
            <Wallet size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Patrimônio Atual
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums truncate">
              {formataMoeda(saldoCarteira)}
            </h2>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shrink-0 shadow-md shadow-orange-500/20">
            <Wallet size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ativos na Carteira
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">
              {carteira.length}
            </h2>
          </div>
        </motion.div>
      </motion.div>

      {/* Barra de Filtros e Busca */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6"
      >
        {/* Input de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ticker ou nome do ativo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
          />
        </div>

        {/* Filtros de Tipo e Operação */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Tipo */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs">
            {(['Todos', 'Ação', 'FII', 'Stock', 'ETF'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filtroTipo === tipo
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {tipo === 'Todos' ? 'Todos' : tipo === 'Ação' ? 'Ações' : tipo === 'FII' ? 'FIIs' : tipo}
              </button>
            ))}
          </div>

          {/* Seletor de Operação */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs">
            {(['Todas', 'Compra', 'Venda'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setFiltroOperacao(op)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filtroOperacao === op
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Seletor de Ordenação */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs">
            <span className="text-gray-400 pl-2 pr-1 flex items-center gap-1 font-semibold text-[11px]">
              <ArrowUpDown size={12} />
              Ordenar:
            </span>
            <button
              type="button"
              onClick={() => handleAlternarOrdenacao('data')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${campoOrdenacao === 'data'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span>Data</span>
              {campoOrdenacao === 'data' && (
                direcaoOrdenacao === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleAlternarOrdenacao('tipo')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${campoOrdenacao === 'tipo'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span>Tipo Ativo</span>
              {campoOrdenacao === 'tipo' && (
                direcaoOrdenacao === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleAlternarOrdenacao('operacao')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${campoOrdenacao === 'operacao'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span>Operação</span>
              {campoOrdenacao === 'operacao' && (
                direcaoOrdenacao === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleAlternarOrdenacao('ticker')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${campoOrdenacao === 'ticker'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span>Ticker</span>
              {campoOrdenacao === 'ticker' && (
                direcaoOrdenacao === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Barra de Status da Ordenação Ativa */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">
            Exibindo <strong className="text-gray-900 dark:text-white">{transacoesFiltradas.length}</strong> transações
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-medium">
            <ArrowUpDown size={12} />
            {campoOrdenacao === 'data'
              ? direcaoOrdenacao === 'desc' ? 'Data: Mais recente primeiro' : 'Data: Mais antiga primeiro'
              : campoOrdenacao === 'tipo'
                ? direcaoOrdenacao === 'asc' ? 'Tipo Ativo: Ações → ETFs → FIIs → Stocks' : 'Tipo Ativo: Stocks → FIIs → ETFs → Ações'
                : campoOrdenacao === 'operacao'
                  ? direcaoOrdenacao === 'asc' ? 'Operação: Compras primeiro' : 'Operação: Vendas primeiro'
                  : campoOrdenacao === 'ticker'
                    ? direcaoOrdenacao === 'asc' ? 'Ticker: A → Z' : 'Ticker: Z → A'
                    : direcaoOrdenacao === 'desc' ? 'Valor Total: Maior primeiro' : 'Valor Total: Menor primeiro'}
          </span>
        </div>
      </div>

      {/* Card da Tabela de Movimentações */}
      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                <th
                  onClick={() => handleAlternarOrdenacao('data')}
                  className="w-[14%] text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Data</span>
                    {campoOrdenacao === 'data' ? (
                      direcaoOrdenacao === 'desc' ? (
                        <ArrowDown size={13} className="text-violet-500" />
                      ) : (
                        <ArrowUp size={13} className="text-violet-500" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleAlternarOrdenacao('tipo')}
                  className="w-[28%] text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ativo / Tipo</span>
                    {campoOrdenacao === 'tipo' ? (
                      direcaoOrdenacao === 'asc' ? (
                        <ArrowUp size={13} className="text-violet-500" />
                      ) : (
                        <ArrowDown size={13} className="text-violet-500" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleAlternarOrdenacao('operacao')}
                  className="w-[14%] text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Operação</span>
                    {campoOrdenacao === 'operacao' ? (
                      direcaoOrdenacao === 'asc' ? (
                        <ArrowUp size={13} className="text-violet-500" />
                      ) : (
                        <ArrowDown size={13} className="text-violet-500" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30" />
                    )}
                  </div>
                </th>
                <th className="w-[10%] text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qtd.
                </th>
                <th className="w-[13%] text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Preço Unitário
                </th>
                <th
                  onClick={() => handleAlternarOrdenacao('valor')}
                  className="w-[13%] text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Valor Total</span>
                    {campoOrdenacao === 'valor' ? (
                      direcaoOrdenacao === 'desc' ? (
                        <ArrowDown size={13} className="text-violet-500" />
                      ) : (
                        <ArrowUp size={13} className="text-violet-500" />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30" />
                    )}
                  </div>
                </th>
                <th className="w-[8%] text-center px-3 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-500 dark:text-violet-400 mb-3">
                        <Receipt size={24} />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Nenhuma transação encontrada
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                        {busca
                          ? 'Tente buscar com outro termo ou limpar os filtros.'
                          : 'Adicione seus aportes para começar a acompanhar o histórico de compras e vendas.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((item) => {
                  const isCompra = (item.tipo || '').toLowerCase().includes('compra');

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-violet-50/40 dark:hover:bg-violet-900/20 transition-colors"
                    >
                      {/* Data */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{formataData(item.data)}</span>
                        </div>
                      </td>

                      {/* Ativo */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-xs font-bold shrink-0">
                            {item.ativo.ticker?.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {item.ativo.ticker}
                              </p>
                              <TipoBadge tipo={item.ativo.tipo} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-44">
                              {item.ativo.nome}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Operação */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${isCompra
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}
                        >
                          {isCompra ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                          <span>{isCompra ? 'Compra' : 'Venda'}</span>
                        </span>
                      </td>

                      {/* Quantidade */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white tabular-nums">
                          {item.quantidade}
                        </span>
                      </td>

                      {/* Preço Unitário */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                          {formataMoeda(item.preco_unitario)}
                        </span>
                      </td>

                      {/* Valor Total */}
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`text-sm font-bold tabular-nums ${isCompra
                            ? 'text-gray-900 dark:text-white'
                            : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                        >
                          {formataMoeda(item.valor_total)}
                        </span>
                      </td>

                      {/* Ações (Excluir) */}
                      <td className="px-3 py-4 text-center">
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center justify-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => handleExcluirTransacao(item.id)}
                              disabled={isDeletingId === item.id}
                              title="Confirmar exclusão"
                              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 shadow-xs"
                            >
                              {isDeletingId === item.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={13} />
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={isDeletingId === item.id}
                              title="Cancelar"
                              className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-xs"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            title="Excluir movimentação"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
