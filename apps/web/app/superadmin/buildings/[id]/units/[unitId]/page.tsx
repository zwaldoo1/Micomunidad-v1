import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

type Props = {
  params: Promise<{
    id: string
    unitId: string
  }>
}

export default async function UnitDetailPage({
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
      'id, building_id, unit_number, floor, proration, active, created_at, updated_at'
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
          href={`/superadmin/buildings/${building.id}`}
          style={{
            display: 'inline-block',
            marginBottom: 24,
            textDecoration: 'none',
            color: '#4b5563',
          }}
        >
          ← Volver al edificio
        </Link>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: 32,
            borderRadius: 16,
            border: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              color: '#6b7280',
              marginTop: 0,
            }}
          >
            {building.name}
          </p>

          <h1
            style={{
              marginBottom: 24,
            }}
          >
            Unidad {unit.unit_number}
          </h1>

          <p>
            <strong>Piso:</strong>{' '}
            {unit.floor ?? 'Sin información'}
          </p>

          <p>
            <strong>Prorrateo:</strong>{' '}
            {unit.proration ?? 'Sin definir'}
          </p>

          <p>
            <strong>Estado:</strong>{' '}
            <span
              style={{
                color: unit.active
                  ? '#047857'
                  : '#b91c1c',
              }}
            >
              {unit.active ? 'Activa' : 'Inactiva'}
            </span>
          </p>

          <div
            style={{
              marginTop: 28,
            }}
          >
            <Link
              href={`/superadmin/buildings/${building.id}/units/${unit.id}/edit`}
              style={{
                display: 'inline-block',
                padding: '12px 18px',
                backgroundColor: '#111827',
                color: '#ffffff',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Editar unidad <Link
  href={`/superadmin/buildings/${building.id}/units/${unit.id}/members`}
  style={{
    display: 'inline-block',
    marginLeft: 12,
    padding: '12px 18px',
    backgroundColor: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: 600,
  }}
>
  Personas
</Link>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}