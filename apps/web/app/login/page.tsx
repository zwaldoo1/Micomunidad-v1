'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '../../utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/superadmin')
    router.refresh()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: 24,
        color: '#111827',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#ffffff',
          padding: 36,
          borderRadius: 18,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: 30, marginBottom: 8 }}>
          MiComunidad
        </h1>

        <p style={{ marginBottom: 30, color: '#6b7280' }}>
          Ingresa a tu cuenta
        </p>

        <label>Correo electrónico</label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{
            width: '100%',
            padding: 14,
            marginTop: 8,
            marginBottom: 18,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        <label>Contraseña</label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{
            width: '100%',
            padding: 14,
            marginTop: 8,
            marginBottom: 22,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        {error && (
          <p
            style={{
              color: '#dc2626',
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 15,
            border: 0,
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  )
}