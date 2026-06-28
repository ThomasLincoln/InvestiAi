import { useLoaderData } from "react-router";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

import type { Ativo } from "~/types";
import Ativos from "~/components/Ativos";
import AddInvestimento from "~/components/AddInvestimentoComponent";

export async function loader() {
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    }
  }
}


export default function Settings() {
  const data = useLoaderData();

  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env } = data as {
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string };
  };
  const supabase = createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [carteira, setCarteira] = useState<Ativo[]>([]);

  useEffect(() => {
    fetchAtivos();
    fetchCarteira();
  }, []);


  async function fetchAtivos() {
    const { data } = await supabase.from('ativos_base').select('*');
    setAtivos(data ?? []);
  }

  async function fetchCarteira() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('transacoes').select('id, Quantidade, Ativo (ticker, nome), preco_unitario')
        .eq('Usuario', user.id);
      const dadosBrutos = data ?? [];
      const dadosTransformados = dadosBrutos.map((item) => {
        return {
          id: item.id,
          ticker: (item.Ativo as any).ticker,
          nome: (item.Ativo as any).nome,
          quantidade: item.Quantidade,
          preco: item.preco_unitario,
        }
      })
      console.log("dados transformados: ", dadosTransformados)
      setCarteira(dadosTransformados ?? []);
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Ativos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Acompanhe seus investimentos</p>
        </div>
        <AddInvestimento items={ativos} supabase={supabase} />
      </div>
      <Ativos items={carteira} />
    </div>
  );
}