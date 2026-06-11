import { SupabaseClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router';

interface ButtonLogOutProps {
  supabase: SupabaseClient;
}

export default function ButtonLogOut({supabase} : ButtonLogOutProps) {
  const navigate = useNavigate();
  async function signOut() {
    console.log("Objeto supabase recebido:", supabase);
    if (supabase && supabase.auth) {
      await supabase.auth.signOut();
      navigate("/");
    } else {
      console.error("Erro: O cliente Supabase está incompleto ou mal formado.");
    }
  }
  return (
    <button onClick={signOut}>
      Sair
    </button>
  );
}
