import SideBar from "~/components/sideBar";
import { useLoaderData } from "react-router";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

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

  return (
    <SideBar
      isOpen={isSidebarOpen}
      toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      supabase={ supabase }
    />
  );
}