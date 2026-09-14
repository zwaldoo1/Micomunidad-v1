import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    data: profile,
    error,
  } = await supabase
    .from('profiles')
    .select(
      'id, full_name, phone, email'
    )
    .eq('id', user.id)
    .single()

  if (error || !profile) {
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
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          <Link
            href="/superadmin"
            style={{
              color: '#4b5563',
              textDecoration: 'none',
            }}
          >
            ← Volver al panel
          </Link>

          <div
            style={{
              marginTop: 30,
              padding: 24,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 12,
            }}
          >
            No fue posible cargar el perfil.
          </div>
        </div>
      </main>
    )
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
          maxWidth: 900,
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

        <h1>Mi perfil</h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          Administra tus datos personales.
        </p>

        <ProfileForm
          userId={profile.id}
          email={profile.email ?? user.email ?? ''}
          initialFullName={profile.full_name ?? ''}
          initialPhone={profile.phone ?? ''}
        />
      </div>
    </main>
  )
}