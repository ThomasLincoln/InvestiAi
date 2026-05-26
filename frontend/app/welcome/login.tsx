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
    <div>
      <h1>Login</h1>
      {isClient && <div id="google-signin-button" />}
    </div>
  );
}