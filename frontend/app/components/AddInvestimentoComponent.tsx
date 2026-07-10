import { useState, useEffect } from 'react';
import type { Ativo } from '~/types';
import { ComboboxAtivo } from './ComboBoxAtivo';
import InputCurrency, { moedas, type Moeda } from './InputCurrency';
import { Plus, X, TrendingUp } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useLoaderData } from 'react-router';

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
  supabase,
  onAporteSucesso,
}: {
  items: Ativo[];
  supabase: SupabaseClient;
  onAporteSucesso: () => void;
}) {
  const data = useLoaderData();

  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env } = data as {
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string; VITE_API_URL: string };
  };

  const [isOpen, setIsOpen] = useState(false);
  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [quantidade, setQuantidade] = useState(0);
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [moeda, setMoeda] = useState<Moeda>(moedas[0]);

  const incrementar = () => setQuantidade(quantidade + 1);
  const decrementar = () => setQuantidade(quantidade > 0 ? quantidade - 1 : 0);

  const resetForm = () => {
    setAtivo(null);
    setQuantidade(0);
    setDataAquisicao('');
    setPrecoUnitario(0);
    setValorTotal(0);
    setMoeda(moedas[0]);
  };

  const fecharModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(ativo);
    if (!ativo || !ativo.id) {
      alert('Por favor, selecione um ativo válido.');
      return;
    }

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
    };

    const response = await fetch(`${env.VITE_API_URL}/usuario/aportar_ativo`, {
      method: 'POST',
      headers: {
        Authorization: session ? `Bearer ${session.access_token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novoAporte),
    });
    if (response.status != 200) {
      console.error('Erro ao salvar:', response.statusText);
      alert('Falha ao registrar aporte.');
    } else {
      alert('Aporte registrado com sucesso!');
      onAporteSucesso();
      fecharModal();
    }
    fecharModal();
  };

  useEffect(() => {
    setValorTotal(quantidade * precoUnitario);
  }, [quantidade, precoUnitario]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto
                    text-white bg-violet-600 rounded-xl
                    hover:bg-violet-500 active:bg-violet-700
                    transition-all shadow-lg shadow-violet-600/25
                    hover:shadow-violet-500/40 hover:scale-[1.02]
                    text-sm font-medium"
      >
        <Plus size={18} strokeWidth={2.5} />
        Novo Lançamento
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl
                            bg-gray-900 border border-gray-800
                            shadow-2xl shadow-black/50"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ativo
                  </label>
                  <ComboboxAtivo
                    items={items}
                    placeholder="Buscar ativo..."
                    value={ativo}
                    onChange={setAtivo}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Quantidade
                  </label>
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
                                                outline-none border-none w-3/5"
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
                  onValorChange={setValorTotal}
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
                  className="flex-1 h-11 rounded-xl text-sm font-medium
                                        text-white bg-violet-600
                                        hover:bg-violet-500 active:bg-violet-700
                                        transition-all shadow-lg shadow-violet-600/25
                                        hover:shadow-violet-500/40"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
