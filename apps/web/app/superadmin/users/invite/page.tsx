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
    error: roleError,
  } = await supabase.rpc('is_platform_admin')

  if (roleError || !isPlatformAdmin) {
    redirect('/')
  }

  const {
    data: buildings,
    error: buildingsError,
  } = await supabase
    .from('buildings')
    .select('id, name, active')
    .eq('active', true)
    .order('name')

  const {
    data: units,
    error: unitsError,
  } = await supabase
    .from('units')
    .select(
      'id, building_id, unit_number, active'
    )
    .eq('active', true)
    .order('unit_number')

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

        <h1>Invitar persona</h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          Crea la cuenta y asigna sus permisos
          dentro de MiComunidad.
        </p>

        {(buildingsError || unitsError) && (
          <div
            style={{
              padding: 16,
              marginBottom: 20,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
            }}
          >
            No fue posible cargar edificios o unidades.
          </div>
        )}

        {!buildingsError && !unitsError && (
          <InviteForm
            buildings={buildings ?? []}
            units={units ?? []}
          />
        )}
      </div>
    </main>
  )
}