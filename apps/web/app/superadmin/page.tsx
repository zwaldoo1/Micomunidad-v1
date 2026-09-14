import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <h2>Edificios</h2>

          <Link
            href="/superadmin/buildings/new"
            style={{
              padding: '12px 18px',
              backgroundColor: '#111827',
              color: '#ffffff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            + Crear edificio
          </Link>
        </div>

        {error && (
          <p style={{ color: '#b91c1c' }}>
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
              Tu plataforma está preparada para crear el primer edificio.
            </p>
          </div>
        )}

        {buildings?.map((building) => (
          <Link
            key={building.id}
            href={`/superadmin/buildings/${building.id}`}
            style={{
              display: 'block',
              marginTop: 15,
              backgroundColor: '#ffffff',
              padding: 22,
              borderRadius: 14,
              color: '#111827',
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: 18,
                    display: 'block',
                  }}
                >
                  {building.name}
                </strong>

                <p
                  style={{
                    marginTop: 6,
                    marginBottom: 6,
                  }}
                >
                  {building.address ?? 'Sin dirección'}
                </p>

                <span
                  style={{
                    fontSize: 14,
                    color: building.active
                      ? '#047857'
                      : '#b91c1c',
                  }}
                >
                  {building.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <span
                style={{
                  fontSize: 24,
                  color: '#6b7280',
                }}
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}