import { useState, useEffect, use } from 'react'
import { useSearchParams } from "react-router";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [claims, setClaims] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const hasTokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type');

  const [verifying, setVerifying] = useState(!!hasTokenHash)
  const [authError, setAuthError] = useState(null)
  const [authSuccess, setAuthSuccess] = useState(false)

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if(token_hash){
      supabase.auth
        .verifyOtp({
          token_hash,
          type: type || 'email',
        })
        .then(({error}) => {
          if (error) {
            setAuthSuccess(true)
            
          }
        })
    }
  })
  
  return (
    <h1>teste</h1>
  )
}
