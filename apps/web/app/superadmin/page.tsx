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

  const {
    data: buildings,
    error: buildingsError,
  } = await supabase
    .from('buildings')
    .select(
      'id, name, address, rut, active, created_at'
    )
    .order('created_at', {
      ascending: false,
    })

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
        <div
          style={{
            marginBottom: 30,
          }}
        >
          <h1
            style={{
              marginBottom: 6,
            }}
          >
            Panel Superadministrador
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
            }}
          >
            MiComunidad
          </p>
        </div>

        <hr
          style={{
            marginBottom: 30,
            border: 0,
            borderTop: '1px solid #d1d5db',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div>
            <h2
              style={{
                marginBottom: 4,
              }}
            >
              Edificios
            </h2>

            <p
              style={{
                marginTop: 0,
                color: '#6b7280',
              }}
            >
              Administra las comunidades registradas en la plataforma.
            </p>
          </div>

          <Link
            href="/superadmin/buildings/new"
            style={{
              padding: '12px 18px',
              backgroundColor: '#111827',
              color: '#ffffff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            + Crear edificio
          </Link>
        </div>

        {buildingsError && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
            }}
          >
            Error cargando edificios:{' '}
            {buildingsError.message}
          </div>
        )}

        {!buildingsError &&
          buildings?.length === 0 && (
            <div
              style={{
                marginTop: 24,
                backgroundColor: '#ffffff',
                padding: 30,
                borderRadius: 14,
                border: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                }}
              >
                No existen edificios todavía
              </h3>

              <p
                style={{
                  marginBottom: 0,
                  color: '#6b7280',
                }}
              >
                Tu plataforma está preparada para crear el primer edificio.
              </p>
            </div>
          )}

        {!buildingsError &&
          buildings?.map((building) => (
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
                    {building.address ??
                      'Sin dirección'}
                  </p>

                  {building.rut && (
                    <p
                      style={{
                        marginTop: 0,
                        marginBottom: 8,
                        color: '#6b7280',
                        fontSize: 14,
                      }}
                    >
                      RUT: {building.rut}
                    </p>
                  )}

                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: building.active
                        ? '#047857'
                        : '#b91c1c',
                    }}
                  >
                    {building.active
                      ? 'Activo'
                      : 'Inactivo'}
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