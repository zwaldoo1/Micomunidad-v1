import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import MemberForm from './member-form'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function NewBuildingMemberPage({
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
    data: profiles,
    error: profilesError,
  } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, phone'
    )
    .order('email', {
      ascending: true,
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
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <Link
          href={`/superadmin/buildings/${building.id}/members`}
          style={{
            display: 'inline-block',
            marginBottom: 24,
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver a personas
        </Link>

        <h1>Agregar persona</h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          Edificio: {building.name}
        </p>

        {profilesError && (
          <div
            style={{
              padding: 16,
              marginBottom: 20,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
            }}
          >
            No fue posible cargar los
            usuarios: {profilesError.message}
          </div>
        )}

        {!profilesError &&
          profiles?.length === 0 && (
            <div
              style={{
                padding: 24,
                backgroundColor: '#ffffff',
                borderRadius: 14,
              }}
            >
              No existen perfiles disponibles.
            </div>
          )}

        {!profilesError &&
          profiles &&
          profiles.length > 0 && (
            <MemberForm
              buildingId={building.id}
              profiles={profiles}
            />
          )}
      </div>
    </main>
  )
}