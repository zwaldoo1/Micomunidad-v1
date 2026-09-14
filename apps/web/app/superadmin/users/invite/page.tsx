import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import InviteForm from './invite-form'

export default async function InviteUserPage() {
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
  } = await supabase.rpc(
    'is_platform_admin'
  )

  if (
    error ||
    !isPlatformAdmin
  ) {
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

        <h1>
          Invitar persona
        </h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          Envía una invitación para
          crear una cuenta en
          MiComunidad.
        </p>

        <InviteForm />
      </div>
    </main>
  )
}