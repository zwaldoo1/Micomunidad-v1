import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '../../../../utils/supabase/server'
import BuildingForm from './building-form'

export default async function NewBuildingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    data: isPlatformAdmin,
    error,
  } = await supabase.rpc('is_platform_admin')

  if (error || !isPlatformAdmin) {
    redirect('/')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        color: '#111827',
        padding: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Link
          href="/superadmin"
          style={{
            display: 'inline-block',
            marginBottom: 24,
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver al panel
        </Link>

        <h1
          style={{
            fontSize: 32,
            marginBottom: 8,
          }}
        >
          Crear edificio
        </h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          Registra una nueva comunidad en MiComunidad.
        </p>

        <BuildingForm />
      </div>
    </main>
  )
}