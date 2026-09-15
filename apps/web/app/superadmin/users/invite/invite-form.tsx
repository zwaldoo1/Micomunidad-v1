'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Building = {
  id: string
  name: string
  active: boolean
}

type Unit = {
  id: string
  building_id: string
  unit_number: string
  active: boolean
}

type BuildingRole =
  | 'admin'
  | 'owner'
  | 'resident'

type UnitRole =
  | 'owner'
  | 'resident'

type Props = {
  buildings: Building[]
  units: Unit[]
}

export default function InviteForm({
  buildings,
  units,
}: Props) {
  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [buildingId, setBuildingId] =
    useState('')

  const [
    buildingRole,
    setBuildingRole,
  ] =
    useState<BuildingRole>('resident')

  const [unitId, setUnitId] =
    useState('')

  const [
    unitRole,
    setUnitRole,
  ] =
    useState<UnitRole>('resident')

  const [loading, setLoading] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const availableUnits = useMemo(() => {
    if (!buildingId) {
      return []
    }

    return units.filter(
      (unit) =>
        unit.building_id === buildingId &&
        unit.active
    )
  }, [buildingId, units])

  function handleBuildingChange(
    newBuildingId: string
  ) {
    setBuildingId(newBuildingId)

    /*
     * Si cambia el edificio,
     * limpiamos la unidad seleccionada
     * para evitar relacionar una unidad
     * perteneciente a otro edificio.
     */
    setUnitId('')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const cleanName =
      fullName.trim()

    const cleanEmail =
      email.trim().toLowerCase()

    const cleanPhone =
      phone.trim()

    if (!cleanName) {
      setErrorMessage(
        'El nombre completo es obligatorio.'
      )

      setLoading(false)
      return
    }

    if (!cleanEmail) {
      setErrorMessage(
        'El correo es obligatorio.'
      )

      setLoading(false)
      return
    }

    if (!buildingId) {
      setErrorMessage(
        'Debes seleccionar un edificio.'
      )

      setLoading(false)
      return
    }

    try {
      const response =
        await fetch(
          '/api/admin/invite-user',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              fullName: cleanName,
              email: cleanEmail,
              phone:
                cleanPhone || null,

              buildingId,
              buildingRole,

              unitId:
                unitId || null,

              unitRole:
                unitId
                  ? unitRole
                  : null,
            }),
          }
        )

      const result =
        await response.json()

      if (!response.ok) {
        setErrorMessage(
          result.error ||
            'No fue posible enviar la invitación.'
        )

        setLoading(false)
        return
      }

      setSuccessMessage(
        'Invitación enviada correctamente.'
      )

      /*
       * Dejamos limpio el formulario
       * después de una invitación correcta.
       */
      setFullName('')
      setEmail('')
      setPhone('')
      setBuildingId('')
      setBuildingRole('resident')
      setUnitId('')
      setUnitRole('resident')
    } catch (error) {
      console.error(
        'Invite form error:',
        error
      )

      setErrorMessage(
        'No fue posible conectar con el servidor.'
      )
    }

    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 650,
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 16,
        border:
          '1px solid #e5e7eb',
      }}
    >
      {/* DATOS PERSONALES */}

      <div
        style={{
          marginBottom: 28,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 6,
            fontSize: 20,
          }}
        >
          Datos personales
        </h2>

        <p
          style={{
            marginTop: 0,
            color: '#6b7280',
          }}
        >
          Información de la persona
          que recibirá la invitación.
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
        }}
      >
        <label
          htmlFor="fullName"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Nombre completo *
        </label>

        <input
          id="fullName"
          value={fullName}
          onChange={(event) =>
            setFullName(
              event.target.value
            )
          }
          required
          placeholder="Ej: Juan Pérez"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      <div
        style={{
          marginBottom: 20,
        }}
      >
        <label
          htmlFor="email"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Correo *
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          required
          placeholder="persona@email.com"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      <div
        style={{
          marginBottom: 32,
        }}
      >
        <label
          htmlFor="phone"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Teléfono
        </label>

        <input
          id="phone"
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
          placeholder="+56 9 1234 5678"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      {/* EDIFICIO */}

      <div
        style={{
          paddingTop: 26,
          borderTop:
            '1px solid #e5e7eb',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 6,
            fontSize: 20,
          }}
        >
          Asignación al edificio
        </h2>

        <p
          style={{
            marginTop: 0,
            color: '#6b7280',
          }}
        >
          Define a qué comunidad
          pertenecerá esta persona.
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
        }}
      >
        <label
          htmlFor="building"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Edificio *
        </label>

        <select
          id="building"
          value={buildingId}
          onChange={(event) =>
            handleBuildingChange(
              event.target.value
            )
          }
          required
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            fontSize: 16,
            backgroundColor:
              '#ffffff',
          }}
        >
          <option value="">
            Selecciona un edificio
          </option>

          {buildings.map(
            (building) => (
              <option
                key={building.id}
                value={building.id}
              >
                {building.name}
              </option>
            )
          )}
        </select>
      </div>

      <div
        style={{
          marginBottom: 32,
        }}
      >
        <label
          htmlFor="buildingRole"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Rol en el edificio *
        </label>

        <select
          id="buildingRole"
          value={buildingRole}
          onChange={(event) =>
            setBuildingRole(
              event.target
                .value as BuildingRole
            )
          }
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            fontSize: 16,
            backgroundColor:
              '#ffffff',
          }}
        >
          <option value="admin">
            Administrador
          </option>

          <option value="owner">
            Propietario
          </option>

          <option value="resident">
            Residente
          </option>
        </select>
      </div>

      {/* UNIDAD */}

      <div
        style={{
          paddingTop: 26,
          borderTop:
            '1px solid #e5e7eb',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 6,
            fontSize: 20,
          }}
        >
          Asignación a unidad
        </h2>

        <p
          style={{
            marginTop: 0,
            color: '#6b7280',
          }}
        >
          Esta sección es opcional.
          Puedes asociar directamente
          la persona a una unidad.
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
        }}
      >
        <label
          htmlFor="unit"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Unidad
        </label>

        <select
          id="unit"
          value={unitId}
          disabled={!buildingId}
          onChange={(event) =>
            setUnitId(
              event.target.value
            )
          }
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            fontSize: 16,
            backgroundColor:
              buildingId
                ? '#ffffff'
                : '#f3f4f6',
          }}
        >
          <option value="">
            Sin unidad
          </option>

          {availableUnits.map(
            (unit) => (
              <option
                key={unit.id}
                value={unit.id}
              >
                Unidad{' '}
                {unit.unit_number}
              </option>
            )
          )}
        </select>

        {buildingId &&
          availableUnits.length ===
            0 && (
            <p
              style={{
                color: '#6b7280',
                fontSize: 14,
                marginBottom: 0,
              }}
            >
              Este edificio no tiene
              unidades activas.
            </p>
          )}
      </div>

      {unitId && (
        <div
          style={{
            marginBottom: 28,
          }}
        >
          <label
            htmlFor="unitRole"
            style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Rol en la unidad *
          </label>

          <select
            id="unitRole"
            value={unitRole}
            onChange={(event) =>
              setUnitRole(
                event.target
                  .value as UnitRole
              )
            }
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 10,
              border:
                '1px solid #d1d5db',
              fontSize: 16,
              backgroundColor:
                '#ffffff',
            }}
          >
            <option value="owner">
              Propietario
            </option>

            <option value="resident">
              Residente
            </option>
          </select>
        </div>
      )}

      {/* RESUMEN */}

      {buildingId && (
        <div
          style={{
            padding: 18,
            marginBottom: 24,
            backgroundColor:
              '#f9fafb',
            borderRadius: 12,
          }}
        >
          <strong>
            Resumen de asignación
          </strong>

          <p
            style={{
              marginBottom: 6,
            }}
          >
            Rol edificio:{' '}
            <strong>
              {buildingRole === 'admin'
                ? 'Administrador'
                : buildingRole ===
                    'owner'
                  ? 'Propietario'
                  : 'Residente'}
            </strong>
          </p>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            Unidad:{' '}
            <strong>
              {unitId
                ? availableUnits.find(
                    (unit) =>
                      unit.id === unitId
                  )
                    ?.unit_number ??
                  'Seleccionada'
                : 'Sin unidad'}
            </strong>

            {unitId && (
              <>
                {' '}
                ·{' '}
                {unitRole === 'owner'
                  ? 'Propietario'
                  : 'Residente'}
              </>
            )}
          </p>
        </div>
      )}

      {/* MENSAJES */}

      {errorMessage && (
        <div
          style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 10,
            backgroundColor:
              '#fee2e2',
            color: '#991b1b',
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 10,
            backgroundColor:
              '#d1fae5',
            color: '#065f46',
          }}
        >
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '13px 18px',
          border: 0,
          borderRadius: 10,
          backgroundColor:
            '#111827',
          color: '#ffffff',
          fontWeight: 600,
          cursor:
            loading
              ? 'not-allowed'
              : 'pointer',
          opacity:
            loading
              ? 0.7
              : 1,
        }}
      >
        {loading
          ? 'Enviando...'
          : 'Enviar invitación'}
      </button>
    </form>
  )
}