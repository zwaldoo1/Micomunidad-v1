import { redirect } from 'next/navigation'

import { createClient } from '../../utils/supabase/server'

export default async function SuperadminPage() {
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

  const { data: buildings, error } = await supabase
    .from('buildings')
    .select('id, name, address, active, created_at')
    .order('created_at', { ascending: false })

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
        <h1>Panel Superadministrador</h1>

        <p style={{ color: '#6b7280' }}>
          MiComunidad
        </p>

        <hr style={{ margin: '30px 0' }} />

        <h2>Edificios</h2>

        {error && (
          <p>
            Error cargando edificios: {error.message}
          </p>
        )}

        {!error && buildings?.length === 0 && (
          <div
            style={{
              marginTop: 20,
              backgroundColor: '#ffffff',
              padding: 30,
              borderRadius: 14,
            }}
          >
            <h3>No existen edificios todavía</h3>

            <p>
              Tu plataforma está preparada para crear
              el primer edificio.
            </p>
          </div>
        )}

        {buildings?.map((building) => (
          <div
            key={building.id}
            style={{
              marginTop: 15,
              backgroundColor: '#ffffff',
              padding: 20,
              borderRadius: 12,
            }}
          >
            <strong>{building.name}</strong>

            <p>{building.address ?? 'Sin dirección'}</p>
          </div>
        ))}
      </div>
    </main>
  )
}