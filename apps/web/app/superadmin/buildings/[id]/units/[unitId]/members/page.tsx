import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

type Props = {
  params: Promise<{
    id: string
    unitId: string
  }>
}

export default async function UnitMembersPage({
  params,
}: Props) {
  const { id, unitId } = await params

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
    data: building,
    error: buildingError,
  } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('id', id)
    .single()

  if (buildingError || !building) {
    notFound()
  }

  const {
    data: unit,
    error: unitError,
  } = await supabase
    .from('units')
    .select(
      'id, building_id, unit_number, floor, active'
    )
    .eq('id', unitId)
    .eq('building_id', building.id)
    .single()

  if (unitError || !unit) {
    notFound()
  }

  const {
    data: memberships,
    error: membershipsError,
  } = await supabase
    .from('unit_members')
    .select(`
      id,
      user_id,
      role,
      active,
      start_date,
      end_date,
      created_at
    `)
    .eq('unit_id', unit.id)
    .order('created_at', {
      ascending: true,
    })

  const userIds = Array.from(
    new Set(
      (memberships ?? []).map(
        (membership) => membership.user_id
      )
    )
  )

  const profilesMap = new Map<
    string,
    {
      id: string
      full_name: string | null
      email: string | null
      phone: string | null
    }
  >()

  let profilesErrorMessage = ''

  if (userIds.length > 0) {
    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, phone'
      )
      .in('id', userIds)

    if (profilesError) {
      profilesErrorMessage =
        profilesError.message
    }

    profiles?.forEach((profile) => {
      profilesMap.set(
        profile.id,
        profile
      )
    })
  }

  function getRoleLabel(
    role: 'owner' | 'resident'
  ) {
    return role === 'owner'
      ? 'Propietario'
      : 'Residente'
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
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <Link
          href={`/superadmin/buildings/${building.id}/units/${unit.id}`}
          style={{
            display: 'inline-block',
            marginBottom: 24,
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver a la unidad
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div>
            <h1
              style={{
                marginBottom: 6,
              }}
            >
              Personas de la unidad
            </h1>

            <p
              style={{
                marginTop: 0,
                color: '#6b7280',
              }}
            >
              {building.name} · Unidad{' '}
              {unit.unit_number}
            </p>
          </div>

          <Link
            href={`/superadmin/buildings/${building.id}/units/${unit.id}/members/new`}
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
            + Asignar persona
          </Link>
        </div>

        {membershipsError && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
            }}
          >
            Error cargando personas:{' '}
            {membershipsError.message}
          </div>
        )}

        {profilesErrorMessage && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: 10,
            }}
          >
            Error cargando perfiles:{' '}
            {profilesErrorMessage}
          </div>
        )}

        {!membershipsError &&
          memberships?.length === 0 && (
            <div
              style={{
                marginTop: 24,
                padding: 28,
                backgroundColor: '#ffffff',
                borderRadius: 14,
                border:
                  '1px solid #e5e7eb',
              }}
            >
              <strong>
                No existen personas
                asociadas a esta unidad.
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  color: '#6b7280',
                }}
              >
                Asigna un propietario o
                residente.
              </p>
            </div>
          )}

        {memberships?.map(
          (membership) => {
            const profile =
              profilesMap.get(
                membership.user_id
              )

            return (
              <div
                key={membership.id}
                style={{
                  marginTop: 14,
                  padding: 22,
                  backgroundColor:
                    '#ffffff',
                  borderRadius: 14,
                  border:
                    '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    gap: 20,
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: 18,
                      }}
                    >
                      {profile?.full_name ||
                        'Sin nombre'}
                    </strong>

                    <p>
                      {profile?.email ||
                        'Sin correo'}
                    </p>

                    <p
                      style={{
                        color: '#6b7280',
                      }}
                    >
                      Teléfono:{' '}
                      {profile?.phone ||
                        'Sin teléfono'}
                    </p>

                    <p>
                      Rol:{' '}
                      <strong>
                        {getRoleLabel(
                          membership.role
                        )}
                      </strong>
                    </p>

                    {membership.start_date && (
                      <p>
                        Desde:{' '}
                        {membership.start_date}
                      </p>
                    )}
                  </div>

                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        membership.active
                          ? '#047857'
                          : '#b91c1c',
                    }}
                  >
                    {membership.active
                      ? 'Activo'
                      : 'Inactivo'}
                  </span>
                </div>
              </div>
            )
          }
        )}
      </div>
    </main>
  )
}