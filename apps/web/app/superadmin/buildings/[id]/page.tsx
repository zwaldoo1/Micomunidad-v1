import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function BuildingDetailPage({
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
    .select(
      'id, unit_number, floor, proration, active, created_at'
    )
    .eq('building_id', building.id)
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
            display: 'inline-block',
            marginBottom: 24,
            color: '#4b5563',
            textDecoration: 'none',
          }}
        >
          ← Volver al panel
        </Link>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: 30,
            borderRadius: 16,
            border: '1px solid #e5e7eb',
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: 20,
            }}
          >
            {building.name}
          </h1>

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
            <span
              style={{
                color: building.active
                  ? '#047857'
                  : '#b91c1c',
              }}
            >
              {building.active ? 'Activo' : 'Inactivo'}
            </span>
          </p>
        </div>

        <div
          style={{
            marginTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <h2>Departamentos / Unidades</h2>

          <Link
            href={`/superadmin/buildings/${building.id}/units/new`}
            style={{
              padding: '12px 18px',
              backgroundColor: '#111827',
              color: '#ffffff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            + Crear unidad
          </Link>
        </div>

        {unitsError && (
          <div
            style={{
              marginTop: 20,
              padding: 20,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 12,
            }}
          >
            Error cargando unidades: {unitsError.message}
          </div>
        )}

        {!unitsError && units?.length === 0 && (
          <div
            style={{
              marginTop: 20,
              padding: 28,
              backgroundColor: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e5e7eb',
            }}
          >
            <strong>No existen unidades todavía.</strong>

            <p
              style={{
                marginBottom: 0,
                color: '#6b7280',
              }}
            >
              Crea el primer departamento o unidad de este edificio.
            </p>
          </div>
        )}

        {units?.map((unit) => (
          <Link
            key={unit.id}
            href={`/superadmin/buildings/${building.id}/units/${unit.id}`}
            style={{
              display: 'block',
              marginTop: 14,
              padding: 20,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              textDecoration: 'none',
              color: '#111827',
              cursor: 'pointer',
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
                  }}
                >
                  Unidad {unit.unit_number}
                </strong>

                <p>
                  Piso: {unit.floor ?? 'Sin información'}
                </p>

                <p>
                  Prorrateo: {unit.proration ?? 'Sin definir'}
                </p>

                <p
                  style={{
                    marginBottom: 0,
                    color: unit.active
                      ? '#047857'
                      : '#b91c1c',
                  }}
                >
                  {unit.active ? 'Activa' : 'Inactiva'}
                </p>
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