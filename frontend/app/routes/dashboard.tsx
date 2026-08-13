import { Outlet, useLoaderData } from 'react-router';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import SideBarComponent from '~/components/SideBarComponent';
import MobileBottomNav from '~/components/MobileBottomNav';
import LoadingScreen from '~/components/LoadingScreen';
import type { User } from '~/types';

export async function clientLoader() {
  const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL || ' ',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ' ',
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = null;
  if (session) {
    const { data } = await supabase
      .from('perfil_pessoal')
      .select('fullname, email, picture, saldo')
      .eq('id', session.user.id)
      .single();
    profile = data;
  }

  return {
    user: profile,
    env: {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    },
  };
}

export function HydrateFallback() {
  return <LoadingScreen message="Carregando painel..." />;
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const data = useLoaderData();
  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env, user } = data as {
    user: User;
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string };
  };
  const supabase = createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 p-2 sm:p-4 gap-2 sm:gap-4 transition-colors">
      <SideBarComponent
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        supabase={supabase}
      />
      <main className="flex-1 min-w-0 overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-950/50 p-4 pb-24 sm:p-6 sm:pb-6 lg:p-8 transition-colors">
        <Outlet context={{ user }} />
      </main>
      <MobileBottomNav supabase={supabase} />
    </div>
  );
}
