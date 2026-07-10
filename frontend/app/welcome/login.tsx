import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { createBrowserClient } from '@supabase/ssr';
import { TrendingUp, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    handleSignInWithGoogle?: (response: any) => void;
    google?: {
      accounts?: {
        id?: {
          initialize: (params: any) => void;
          renderButton: (element: HTMLElement, params: any) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '311352397706-g2nd9g1kio7sg94jqrd0b60o3cfug0hk.apps.googleusercontent.com';

export default function Login() {
  const [isClient, setIsClient] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const data = useLoaderData();
  const navigate = useNavigate();
  if (!data) {
    return <h1>Erro: O loader não retornou dados.</h1>;
  }

  const { env } = data as {
    env: { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string };
  };

  useEffect(() => {
    setIsClient(true);
    const supabase = createBrowserClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

    window.handleSignInWithGoogle = async (response) => {
      setSigningIn(true);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Erro no login:', error.message);
        setSigningIn(false);
      } else {
        navigate('/dashboard');
      }
    };

    const renderGoogleButton = () => {
      const google = window.google?.accounts?.id;
      const target = document.getElementById('google-signin-button');

      if (!google || !target) return false;

      google.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: window.handleSignInWithGoogle,
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      google.renderButton(target, {
        type: 'standard',
        shape: 'pill',
        theme: 'filled_blue',
        text: 'continue_with',
        size: 'large',
        logo_alignment: 'left',
      });

      setButtonReady(true);
      return true;
    };

    if (!renderGoogleButton()) {
      const interval = window.setInterval(() => {
        if (renderGoogleButton()) {
          window.clearInterval(interval);
        }
      }, 100);

      return () => {
        window.clearInterval(interval);
        delete window.handleSignInWithGoogle;
      };
    }

    return () => {
      delete window.handleSignInWithGoogle;
    };
  }, [env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, navigate]);

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-950 transition-colors">
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-300/40 dark:bg-violet-700/20 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-blue-300/40 dark:bg-blue-700/20 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-300/30 dark:bg-emerald-700/20 blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-sm mx-4 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl dark:shadow-gray-950/50 text-center border border-gray-200 dark:border-gray-700 transition-colors ${
          isClient ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
          <TrendingUp size={28} />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Acesse o InvestAi</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Faça login de forma rápida e segura</p>

        <div className="relative flex justify-center min-h-11 items-center">
          {!buttonReady && !signingIn && (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-blue-600" />
          )}

          {signingIn && (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-blue-600" />
              Entrando...
            </div>
          )}

          <div
            id="google-signin-button"
            className={`flex justify-center transition-opacity duration-300 ${
              buttonReady && !signingIn ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <ShieldCheck size={14} />
          Seus dados estão protegidos
        </div>
      </div>
    </div>
  );
}
