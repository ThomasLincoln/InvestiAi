import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { type LoaderFunctionArgs } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const responseHeaders = new Headers()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(key) {
          const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '')
          const cookie = cookies.find((c) => c.name === key)
          return cookie?.value
        },
        set(key, value, options) {
          responseHeaders.append('Set-Cookie', serializeCookieHeader(key, value, options))
        },
        remove (key, options){
          responseHeaders.append('Set-Cookie', serializeCookieHeader(key, '', options))
        },
      },
    }
  )

  return new Response('...', {
    headers: responseHeaders,
  })
}