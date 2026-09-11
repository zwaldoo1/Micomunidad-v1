import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '../../../../utils/supabase/server'
type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function BuildingDetailPage({ params }: Props) {
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
    .select('id, name, address, rut, active, created_at')
    .eq('id', id)
    .single()

  if (buildingError || !building) {
    notFound()
  }

  const {
    data: units,
    error: unitsError,
  } = await supabase
    .from('units')
    .select('id, unit_number, floor, proration, active, created_at')
    .eq('building_id', id)
    .order('unit_number', { ascending: true })

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
          href="/superadmin"
          style={{
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver al panel
        </Link>

        <div
          style={{
            marginTop: 24,
            backgroundColor: '#ffffff',
            padding: 30,
            borderRadius: 16,
          }}
        >
          <h1>{building.name}</h1>

          <p>
            <strong>Dirección:</strong>{' '}
            {building.address ?? 'Sin dirección'}
          </p>

          <p>
            <strong>RUT:</strong>{' '}
            {building.rut ?? 'Sin RUT'}
          </p>

          <p>
            <strong>Estado:</strong>{' '}
            {building.active ? 'Activo' : 'Inactivo'}
          </p>
        </div>

        <div
          style={{
            marginTop: 30,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2>Departamentos / Unidades</h2>

          <Link
            href={`/superadmin/buildings/${building.id}/units/new`}
            style={{
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            + Crear unidad
          </Link>
        </div>

        {unitsError && (
          <p style={{ color: '#b91c1c' }}>
            Error cargando unidades: {unitsError.message}
          </p>
        )}

        {!unitsError && units?.length === 0 && (
          <div
            style={{
              marginTop: 20,
              backgroundColor: '#ffffff',
              padding: 28,
              borderRadius: 14,
            }}
          >
            No existen unidades todavía.
          </div>
        )}

        {units?.map((unit) => (
          <div
            key={unit.id}
            style={{
              marginTop: 14,
              backgroundColor: '#ffffff',
              padding: 20,
              borderRadius: 12,
            }}
          >
            <strong>Unidad {unit.unit_number}</strong>

            <p>Piso: {unit.floor ?? 'Sin información'}</p>

            <p>
              Prorrateo: {unit.proration ?? 'Sin definir'}
            </p>

            <p>
              Estado: {unit.active ? 'Activa' : 'Inactiva'}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}