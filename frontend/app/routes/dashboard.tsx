import ButtonLogOut from "~/components/ButtonLogOut";
import { Link, Outlet, useLoaderData } from "react-router";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import PatrimonioTotal from "~/components/PatrimonioTotal";
import SideBar from "~/components/sideBar";
import type { User } from "~/types";


export async function loader() {
  const supabase = createBrowserClient(process.env.VITE_SUPABASE_URL || " ", process.env.VITE_SUPABASE_PUBLISHABLE_KEY || " ");

  const { data: { session } } = await supabase.auth.getSession();

  let profile = null;
  if (session) {
    const { data } = await supabase
      .from('profiles')
      .select('fullname, email, picture')
      .eq('id', session.user.id)
      .single()
    profile = data;
  }
  return {
    user: profile,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    }
  }
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mudanca = {
    crescimento: true,
    porcentagem: 3.4,
  }
  
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', margin: 0 }}>
      <SideBar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        supabase={supabase}
      ></SideBar>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet context={{ user }}/>
      </main>
    </div>
  );
}