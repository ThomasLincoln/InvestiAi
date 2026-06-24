import { useLoaderData } from "react-router";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import SearchComponent from "~/components/SearchComponent";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      const { data } = await supabase.from('ativos_na_carteira').select('id, Quantidade, Ativo (ticker, nome)')
        .eq('Usuario', user.id);
      const dadosBrutos = data ?? [];
      const dadosTransformados = dadosBrutos.map((item) => {
        return {
          id: item.id,
          ticker: (item.Ativo as any).ticker,
          nome: (item.Ativo as any).nome,
          quantidade: item.Quantidade

        }
      })
      console.log(dadosTransformados)
      setCarteira(dadosTransformados ?? []);
    }
  }
  return (
    <>
      <div className="flex">
        {/* <SearchComponent items={ativos} /> */}
        <AddInvestimento items={ativos}/>
      </div>
      <Ativos items={carteira} />
    </>
  );
}