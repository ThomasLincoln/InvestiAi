import SideBar from "~/components/sideBar";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useLoaderData, useOutletContext } from "react-router";
import type { User } from "~/types";

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
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  })

  const { user } = useOutletContext<{ user: User | null }>();
  if (user?.fullname) {
    setProfile({ ...profile, name: user.fullname })
  }
  if (user?.email) {
    setProfile({ ...profile, email: user.email })
  }
  console.log(user)
  return (
    <div style={{
      display: 'flex',
      margin: 0,
      overflow: 'hidden'
    }}>
      <main style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        <div style={{
          maxWidth: '90%',
          margin: '2rem auto',
          padding: '2rem',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            color: '#1f2937'
          }}>Configurações</h1>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.1rem', color: '#4b5563',
              marginBottom: '1rem', display: 'flex', alignItems: 'center',
              gap: '8px'
            }}><span className="material-icons">person</span> Perfil</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              className="dark:text-gray-500"
            >
              <input
                name="username"
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                style={{
                  padding: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                }} />
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '10px',
                padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '6px'
              }}>
                <span className="material-icons">email</span>
                <span>{profile.email}</span>
              </div>
            </div>
          </section>

          <section className="dark:text-gray-500">
            <h2 style={{
              fontSize: '1.1rem', color: '#4b5563',
              marginBottom: '1rem', display: 'flex', alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons">lock</span>
              Segurança
            </h2>

          </section>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0.8rem 1.5rem', borderRadius: '6px',
              backgroundColor: '#3b82f6', color: 'white',
              border: 'none', cursor: 'pointer'
            }}>
              <span className="material-icons">save</span> Salvar Alterações
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}