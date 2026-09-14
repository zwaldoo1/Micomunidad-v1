import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import UnitMemberForm from './unit-member-form'

type Props = {
  params: Promise<{
    id: string
    unitId: string
  }>
}

export default async function NewUnitMemberPage({
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
  } = await supabase.rpc(
    'is_platform_admin'
  )

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
      'id, building_id, unit_number'
    )
    .eq('id', unitId)
    .eq(
      'building_id',
      building.id
    )
    .single()

  if (unitError || !unit) {
    notFound()
  }

  /*
   * Solamente mostramos personas
   * activas que ya pertenecen
   * al edificio como owner/resident.
   */
  const {
    data: buildingMembers,
    error: buildingMembersError,
  } = await supabase
    .from('building_members')
    .select(
      'user_id, role, active'
    )
    .eq(
      'building_id',
      building.id
    )
    .eq('active', true)
    .in(
      'role',
      ['owner', 'resident']
    )

  const userIds = Array.from(
    new Set(
      (buildingMembers ?? []).map(
        (member) => member.user_id
      )
    )
  )

  let profiles: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
  }[] = []

  let profilesErrorMessage = ''

  if (userIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, phone'
      )
      .in('id', userIds)
      .order('email')

    profiles = data ?? []

    if (error) {
      profilesErrorMessage =
        error.message
    }
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
          href={`/superadmin/buildings/${building.id}/units/${unit.id}/members`}
          style={{
            display: 'inline-block',
            marginBottom: 24,
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver a personas
        </Link>

        <h1>Asignar persona</h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          {building.name} · Unidad{' '}
          {unit.unit_number}
        </p>

        {buildingMembersError && (
          <div
            style={{
              padding: 16,
              marginBottom: 20,
              backgroundColor:
                '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
            }}
          >
            Error cargando miembros
            del edificio:{' '}
            {
              buildingMembersError.message
            }
          </div>
        )}

        {profilesErrorMessage && (
          <div
            style={{
              padding: 16,
              marginBottom: 20,
              backgroundColor:
                '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
            }}
          >
            Error cargando perfiles:{' '}
            {profilesErrorMessage}
          </div>
        )}

        {!buildingMembersError &&
          !profilesErrorMessage &&
          profiles.length === 0 && (
            <div
              style={{
                padding: 24,
                backgroundColor:
                  '#ffffff',
                borderRadius: 14,
                border:
                  '1px solid #e5e7eb',
              }}
            >
              <strong>
                No hay propietarios o
                residentes disponibles.
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  color: '#6b7280',
                }}
              >
                Primero agrega la
                persona al edificio
                con rol Propietario o
                Residente.
              </p>
            </div>
          )}

        {!buildingMembersError &&
          !profilesErrorMessage &&
          profiles.length > 0 && (
            <UnitMemberForm
              buildingId={
                building.id
              }
              unitId={unit.id}
              profiles={profiles}
            />
          )}
      </div>
    </main>
  )
}