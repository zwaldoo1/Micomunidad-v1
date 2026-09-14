import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import BuildingEditForm from './building-edit-form'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditBuildingPage({
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
    .select('id, name, address, rut, active')
    .eq('id', id)
    .single()

  if (buildingError || !building) {
    notFound()
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

        <h1>Editar edificio</h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          {building.name}
        </p>

        <BuildingEditForm
          buildingId={building.id}
          initialName={building.name}
          initialAddress={building.address ?? ''}
          initialRut={building.rut ?? ''}
          initialActive={building.active}
        />
      </div>
    </main>
  )
}