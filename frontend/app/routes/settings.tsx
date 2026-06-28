import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useLoaderData, useOutletContext } from "react-router";
import { Save, Shield, Mail, Camera, Bell, Palette, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "~/hooks/useTheme";
import type { User as UserType } from "~/types";

export async function loader() {
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    }
  }
}

const themeOptions = [
  { value: "light" as const, label: "Claro", icon: Sun },
  { value: "dark" as const, label: "Escuro", icon: Moon },
  { value: "system" as const, label: "Sistema", icon: Monitor },
];

export default function Settings() {
  const data = useLoaderData();
  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }
  const { env } = data as {
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string };
  };
  const supabase = createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const { user } = useOutletContext<{ user: UserType | null }>();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({
    name: user?.fullname ?? "",
    email: user?.email ?? ""
  });

  const initials = profile.name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie seu perfil e preferências</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
          <div className="relative h-24 bg-linear-to-r from-violet-600 to-indigo-600">
            <div className="absolute -bottom-10 left-6">
              <div className="relative group">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={profile.name}
                    className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-800 bg-violet-100 dark:bg-violet-900/40
                    flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-violet-600 dark:text-violet-400">{initials}</span>
                  </div>
                )}
                <button className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30
                  flex items-center justify-center opacity-0 group-hover:opacity-100
                  transition-all cursor-pointer">
                  <Camera size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-14 px-6 pb-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nome completo
                  </label>
                  <input
                    name="username"
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400
                      transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    E-mail
                  </label>
                  <div className="flex items-center gap-3 h-11 px-4 rounded-xl
                    border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    <Mail size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Appearance */}
          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                <Palette size={16} />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Aparência</h2>
            </div>
            <div className="p-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Tema
              </p>
              <div className="flex gap-2">
                {themeOptions.map((opt) => {
                  const active = theme === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={`
                        flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl
                        border-2 transition-all cursor-pointer text-sm font-medium
                        ${active
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <Icon size={20} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Shield size={16} />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Segurança</h2>
            </div>
            <div className="p-5 space-y-3">
              <SettingsRow label="Autenticação dois fatores" description="Adicione uma camada extra de proteção" defaultEnabled={false} />
              <SettingsRow label="Login com Google" description="Vinculado à sua conta" defaultEnabled={true} />
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Bell size={16} />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notificações</h2>
            </div>
            <div className="p-5 space-y-3">
              <SettingsRow label="Alertas de preço" description="Quando um ativo atingir seu alvo" defaultEnabled={false} />
              <SettingsRow label="Relatório semanal" description="Resumo da sua carteira por e-mail" defaultEnabled={false} />
            </div>
          </section>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button className="flex items-center gap-2 px-5 py-2.5
            text-white bg-violet-600 rounded-xl text-sm font-medium
            hover:bg-violet-500 active:bg-violet-700
            transition-all shadow-lg shadow-violet-600/25
            hover:shadow-violet-500/40 hover:scale-[1.02]">
            <Save size={16} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({ label, description, defaultEnabled }: { label: string; description: string; defaultEnabled: boolean }) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`
          relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer
          ${enabled ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-600'}
        `}
      >
        <div className={`
          absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
          ${enabled ? 'translate-x-5' : 'translate-x-1'}
        `} />
      </button>
    </div>
  );
}
