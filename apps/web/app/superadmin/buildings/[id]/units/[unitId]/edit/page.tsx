import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import UnitEditForm from './unit-edit-form'

type Props = {
  params: Promise<{
    id: string
    unitId: string
  }>
}

export default async function EditUnitPage({
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
      'id, building_id, unit_number, floor, proration, active'
    )
    .eq('id', unitId)
    .eq('building_id', building.id)
    .single()

  if (unitError || !unit) {
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
          href={`/superadmin/buildings/${building.id}/units/${unit.id}`}
          style={{
            display: 'inline-block',
            marginBottom: 24,
            textDecoration: 'none',
            color: '#4b5563',
          }}
        >
          ← Volver a la unidad
        </Link>

        <h1>Editar unidad {unit.unit_number}</h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: 30,
          }}
        >
          Edificio: {building.name}
        </p>

        <UnitEditForm
          buildingId={building.id}
          unitId={unit.id}
          initialUnitNumber={unit.unit_number}
          initialFloor={unit.floor ?? ''}
          initialProration={
            unit.proration === null
              ? ''
              : String(unit.proration)
          }
          initialActive={unit.active}
        />
      </div>
    </main>
  )
}