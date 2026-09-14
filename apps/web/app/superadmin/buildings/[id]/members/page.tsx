import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function BuildingMembersPage({
  params,
}: Props) {
  const { id } = await params

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
    data: members,
    error: membersError,
  } = await supabase
    .from('building_members')
    .select(`
      id,
      user_id,
      role,
      active,
      created_at
    `)
    .eq('building_id', building.id)
    .order('created_at', {
      ascending: true,
    })

  const userIds = Array.from(
    new Set(
      (members ?? []).map((member) => member.user_id)
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
      .select('id, full_name, email, phone')
      .in('id', userIds)

    if (profilesError) {
      profilesErrorMessage = profilesError.message
    }

    profiles?.forEach((profile) => {
      profilesMap.set(profile.id, profile)
    })
  }

  function getRoleLabel(
    role: 'admin' | 'owner' | 'resident'
  ) {
    if (role === 'admin') {
      return 'Administrador'
    }

    if (role === 'owner') {
      return 'Propietario'
    }

    return 'Residente'
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
          href={`/superadmin/buildings/${building.id}`}
          style={{
            display: 'inline-block',
            marginBottom: 24,
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver al edificio
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
              Personas
            </h1>

            <p
              style={{
                marginTop: 0,
                color: '#6b7280',
              }}
            >
              {building.name}
            </p>
          </div>

          <Link
            href={`/superadmin/buildings/${building.id}/members/new`}
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
            + Agregar persona
          </Link>
        </div>

        {membersError && (
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
            {membersError.message}
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

        {!membersError &&
          members?.length === 0 && (
            <div
              style={{
                marginTop: 24,
                padding: 30,
                backgroundColor: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
              }}
            >
              <strong>
                No existen personas asignadas.
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  color: '#6b7280',
                }}
              >
                Agrega el primer administrador,
                propietario o residente del edificio.
              </p>
            </div>
          )}

        {members?.map((member) => {
          const profile =
            profilesMap.get(member.user_id)

          return (
            <div
              key={member.id}
              style={{
                marginTop: 14,
                padding: 22,
                backgroundColor: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
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

                  <p
                    style={{
                      marginBottom: 6,
                    }}
                  >
                    {profile?.email ||
                      'Sin correo'}
                  </p>

                  <p
                    style={{
                      marginTop: 0,
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
                        member.role
                      )}
                    </strong>
                  </p>
                </div>

                <span
                  style={{
                    fontWeight: 600,
                    color: member.active
                      ? '#047857'
                      : '#b91c1c',
                  }}
                >
                  {member.active
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}