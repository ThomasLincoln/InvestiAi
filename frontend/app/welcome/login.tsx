import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from "react-router";
import { createBrowserClient } from '@supabase/ssr';

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

const GOOGLE_CLIENT_ID = "311352397706-g2nd9g1kio7sg94jqrd0b60o3cfug0hk.apps.googleusercontent.com";

export default function Login() {
  const [isClient, setIsClient] = useState(false);
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
      console.log("Função de callback chamada!");

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error("Erro no login:", error.message);
      } else {
        console.log("Login realizado com sucesso!", data);
        // console.log(data);
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
    <div className="flex h-screen justify-center items-center bg-gray-100 dark:bg-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg dark:shadow-gray-950/50 text-center border border-gray-200 dark:border-gray-700">

        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Acesse o InvestAi
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Faça login de forma rápida e segura
        </p>

        <div id="google-signin-button" className="flex justify-center"></div>

      </div>
    </div>
  );
}