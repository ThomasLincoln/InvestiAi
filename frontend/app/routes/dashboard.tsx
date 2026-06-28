import ButtonLogOut from "~/components/ButtonLogOut";
import { Link, Outlet, useLoaderData } from "react-router";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import PatrimonioTotal from "~/components/PatrimonioTotal";
import SideBarComponent from "~/components/SideBarComponent";
import type { User } from "~/types";


export async function clientLoader() {
  const supabase = createBrowserClient(import.meta.env.VITE_SUPABASE_URL || " ", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || " ");

  const { data: { session } } = await supabase.auth.getSession();

  let profile = null;
  if (session) {
    const { data } = await supabase
      .from('perfil_pessoal')
      .select('fullname, email, picture, saldo')
      .eq('id', session.user.id)
      .single()
    profile = data;
  }

  return {
    user: profile,
    env: {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    }
  }
}

export function HydrateFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <p style={{ fontSize: '1.2rem', color: '#4b5563', fontWeight: 'bold' }}>
        Carregando painel...
      </p>
    </div>
  );
}

export default function Dashboard() {
  const data = useLoaderData();
  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env, user } = data as {
    user: User;
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string };
  };
  const supabase = createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mudanca = {
    crescimento: true,
    porcentagem: 3.4,
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 p-4 gap-4 transition-colors">
      <SideBarComponent
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        supabase={supabase}
      />
      <main className="flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-950/50 p-8 transition-colors">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}