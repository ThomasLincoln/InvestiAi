import { useState, useMemo } from 'react';
import type { Ativo } from '~/types';
import { ComboboxAtivo } from './ComboBoxAtivo';
import InputCurrency, { moedas, type Moeda } from './InputCurrency';
import { Plus, X, TrendingUp, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useLoaderData } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

export async function loader() {
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      VITE_API_URL: process.env.VITE_API_URL || '',
    },
  };
}

export default function AddInvestimento({
  items,
  carteira = [],
  supabase,
  onAporteSucesso,
}: {
  items: Ativo[];
  carteira?: Ativo[];
  supabase: SupabaseClient;
  onAporteSucesso: () => void;
}) {
  const data = useLoaderData();
  const [isOpen, setIsOpen] = useState(false);
  const [tipoOperacao, setTipoOperacao] = useState<'Compra' | 'Venda'>('Compra');
  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [quantidade, setQuantidade] = useState(0);
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [moeda, setMoeda] = useState<Moeda>(moedas[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<string>('Todos');

  const valorTotal = quantidade * precoUnitario;

  const safeItems = Array.isArray(items) ? items : [];
  const safeCarteira = useMemo(() => {
    return (Array.isArray(carteira) ? carteira : [])
      .filter((c) => (Number(c.quantidade) || 0) > 0)
      .map((c) => ({
        ...c,
        id: String(c.id ?? (c as any).ID ?? ''),
      }));
  }, [carteira]);

  const ativosDisponiveis = tipoOperacao === 'Venda' ? safeCarteira : safeItems;

  const tiposUnicos = Array.from(
    new Set(ativosDisponiveis.map((i) => i.tipo).filter(Boolean))
  ) as string[];

  const ativosFiltrados =
    tipoFiltro === 'Todos'
      ? ativosDisponiveis
      : ativosDisponiveis.filter((i) => i.tipo === tipoFiltro);

  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env } = data as {
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string; VITE_API_URL: string };
  };


  const incrementar = () => setQuantidade(quantidade + 1);
  const decrementar = () => setQuantidade(quantidade > 0 ? quantidade - 1 : 0);

  const handleMudarTipoOperacao = (novoTipo: 'Compra' | 'Venda') => {
    if (novoTipo !== tipoOperacao) {
      setTipoOperacao(novoTipo);
      setAtivo(null);
      setQuantidade(0);
      setPrecoUnitario(0);
      setTipoFiltro('Todos');
    }
  };

  const resetForm = () => {
    setTipoOperacao('Compra');
    setAtivo(null);
    setQuantidade(0);
    setDataAquisicao('');
    setPrecoUnitario(0);
    setMoeda(moedas[0]);
    setIsSubmitting(false);
  };

  const fecharModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!ativo || !ativo.id) {
      alert('Por favor, selecione um ativo válido.');
      return;
    }

    if (quantidade <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    if (tipoOperacao === 'Venda') {
      const qtdDisponivel = Number(ativo.quantidade) || 0;
      if (quantidade > qtdDisponivel) {
        alert(
          `Quantidade inválida! Você possui ${qtdDisponivel} cota(s) de ${ativo.ticker} na sua carteira.`
        );
        return;
      }
    }

    if (!dataAquisicao) {
      alert('Por favor, selecione a data da operação.');
      return;
    }

    try {
      setIsSubmitting(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert('Você precisa estar logado!');
        return;
      }
      const novoAporte = {
        Ativo: parseInt(ativo.id),
        Quantidade: quantidade,
        preco_unitario: precoUnitario,
        data_transacao: dataAquisicao,
        tipo: tipoOperacao,
      };

      const response = await fetch(`${env.VITE_API_URL}/usuario/aportar_ativo`, {
        method: 'POST',
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoAporte),
      });

      if (response.status !== 200) {
        console.error('Erro ao salvar:', response.statusText);
        alert('Falha ao registrar aporte.');
      } else {
        onAporteSucesso();
        fecharModal();
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Ocorreu um erro ao registrar o aporte.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div>
      {/* Botão com efeito shimmer */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative group overflow-hidden flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto
                    text-white bg-violet-600 rounded-xl
                    hover:bg-violet-500 active:bg-violet-700
                    transition-all shadow-lg shadow-violet-600/25
                    hover:shadow-violet-500/40 hover:scale-[1.02]
                    text-sm font-medium"
      >
        {/* Shimmer sweep */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full
                      bg-gradient-to-r from-transparent via-white/20 to-transparent
                      transition-transform duration-700 ease-in-out"
        />
        <Plus size={18} strokeWidth={2.5} />
        Novo Lançamento
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={fecharModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Panel */}
            <motion.div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl
                          bg-gray-900 border border-gray-800
                          shadow-2xl shadow-black/50"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9
                                    rounded-xl bg-violet-600/15 text-violet-400"
                  >
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Novo Lançamento</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Registre uma nova operação</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex items-center justify-center w-8 h-8
                                    rounded-lg text-gray-500 hover:text-white
                                    hover:bg-gray-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                {/* Tipo de Operação (Compra / Venda) */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tipo de Operação
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/60 rounded-xl border border-gray-700/50">
                    <button
                      type="button"
                      onClick={() => handleMudarTipoOperacao('Compra')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${tipoOperacao === 'Compra'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <ArrowDownLeft size={14} />
                      Compra
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMudarTipoOperacao('Venda')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${tipoOperacao === 'Venda'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <ArrowUpRight size={14} />
                      Venda
                    </button>
                  </div>
                </div>

                {tipoOperacao === 'Venda' && safeCarteira.length === 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                    Você ainda não possui nenhum ativo na carteira para realizar venda.
                  </div>
                )}

                {tiposUnicos.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tipo de Investimento
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTipoFiltro('Todos')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tipoFiltro === 'Todos'
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/50'
                          }`}
                      >
                        Todos
                      </button>
                      {tiposUnicos.map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setTipoFiltro(tipo)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tipoFiltro === tipo
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {tipoOperacao === 'Venda' ? 'Ativo da Carteira' : 'Ativo'}
                    </label>
                    <ComboboxAtivo
                      items={ativosFiltrados}
                      placeholder={tipoOperacao === 'Venda' ? 'Selecione o ativo para vender...' : 'Buscar ativo...'}
                      value={ativo}
                      onChange={(novoAtivo) => {
                        setAtivo(novoAtivo);
                        setPrecoUnitario(novoAtivo.preco || 0);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Quantidade
                      </label>
                      {tipoOperacao === 'Venda' && ativo && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-400">
                            Possui: <strong className="text-white">{ativo.quantidade}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantidade(Number(ativo.quantidade) || 0)}
                            className="text-violet-400 hover:text-violet-300 font-semibold transition-colors underline"
                          >
                            Máx
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex items-center h-10.5 rounded-xl
                                        bg-gray-800/60 border border-gray-700/50 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={decrementar}
                        className="flex items-center justify-center h-full
                                                text-gray-400 hover:text-white hover:bg-gray-700/50
                                                transition-colors border-r border-gray-700/50 px-2"
                      >
                        <span className="text-lg leading-none">−</span>
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={quantidade}
                        className="flex-1 h-full bg-transparent text-center
                                                text-white text-sm font-medium
                                                outline-none border-none w-3/5 tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={incrementar}
                        className="flex items-center justify-center h-full
                                                text-gray-400 hover:text-white hover:bg-gray-700/50
                                                transition-colors border-l border-gray-700/50 px-2"
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Data de Aquisição
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dataAquisicao}
                        onChange={(e) => setDataAquisicao(e.target.value)}
                        className="w-full h-10.5 px-3
                                                bg-gray-800/60 border border-gray-700/50
                                                text-white text-sm rounded-xl
                                                focus:outline-none focus:ring-2
                                                focus:ring-violet-500/40 focus:border-violet-500/50
                                                transition-all scheme-dark"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Preço Unitário
                    </label>
                    <InputCurrency
                      valor={precoUnitario}
                      moeda={moeda}
                      onValorChange={setPrecoUnitario}
                      onMoedaChange={setMoeda}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Valor Total
                  </label>
                  <InputCurrency
                    valor={valorTotal}
                    moeda={moeda}
                    onValorChange={setPrecoUnitario}
                    onMoedaChange={setMoeda}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="flex-1 h-11 rounded-xl text-sm font-medium
                                        text-gray-400 bg-gray-800/60 border border-gray-700/50
                                        hover:text-white hover:bg-gray-800
                                        transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 h-11 rounded-xl text-sm font-medium
                            text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${tipoOperacao === 'Venda'
                        ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-600/25 hover:shadow-rose-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/25 hover:shadow-emerald-500/40'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      `Confirmar ${tipoOperacao}`
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

