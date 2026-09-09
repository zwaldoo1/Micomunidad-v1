import { createClient } from '../utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '60px',
        fontFamily: 'Arial, sans-serif',
        background: '#3b64a3',
        color: '#111827'
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
        }}
      >
        <h1>MiComunidad</h1>

        <h2>Supabase configurado ✅</h2>

        <p>
          Backend:
          {' '}
          Supabase
        </p>

        <p>
          Estado de autenticación:
          {' '}
          <strong>
            {user
              ? 'Usuario autenticado'
              : 'Sin usuario autenticado'}
          </strong>
        </p>
      </div>
    </main>
  )
}