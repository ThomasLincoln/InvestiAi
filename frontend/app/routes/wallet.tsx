import { useLoaderData } from 'react-router';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

import type { Ativo, TransacaoBackend } from '~/types';
import Ativos from '~/components/Ativos';
import AddInvestimento from '~/components/AddInvestimentoComponent';

export async function loader() {
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      VITE_API_URL: process.env.VITE_API_URL || '',
    },
  };
}

export default function Settings() {
  const data = useLoaderData();

  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env } = data as {
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string; VITE_API_URL: string };
  };
  const supabase = createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [carteira, setCarteira] = useState<Ativo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAtivos(), fetchCarteira()]).finally(() => setLoading(false));
  }, []);

  async function fetchAtivos() {
    const response = await fetch(`${env.VITE_API_URL}/ativos/`);
    const data = await response.json();
    setAtivos(data ?? []);
  }

  async function fetchCarteira() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const response = await fetch(`${env.VITE_API_URL}/usuario/ativos`, {
      headers: {
        Authorization: session ? `Bearer ${session.access_token}` : '',
        'Content-Type': 'application/json',
      },
    });

    const ativosNaCarteira = await response.json();
    if (ativosNaCarteira) {
      const dadosBrutos = ativosNaCarteira ?? [];
      const dadosTransformados = dadosBrutos.map((item: TransacaoBackend) => {
        return {
          id: item.id,
          ticker: (item.Ativo as any).ticker,
          nome: (item.Ativo as any).nome,
          quantidade: item.Quantidade,
          preco: item.preco_unitario,
        };
      });
      console.log('dados transformados: ', dadosTransformados);
      setCarteira(dadosTransformados ?? []);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Ativos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe seus investimentos
          </p>
        </div>
        <AddInvestimento items={ativos} supabase={supabase} onAporteSucesso={fetchCarteira} />
      </div>
      <Ativos items={carteira} loading={loading} />
    </div>
  );
}
