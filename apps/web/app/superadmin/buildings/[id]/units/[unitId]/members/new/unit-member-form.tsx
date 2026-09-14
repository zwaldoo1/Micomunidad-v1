'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
}

type Props = {
  buildingId: string
  unitId: string
  profiles: Profile[]
}

type UnitRole =
  | 'owner'
  | 'resident'

export default function UnitMemberForm({
  buildingId,
  unitId,
  profiles,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] =
    useState('')

  const [role, setRole] =
    useState<UnitRole>('resident')

  const [startDate, setStartDate] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')

    if (!userId) {
      setErrorMessage(
        'Debes seleccionar una persona.'
      )

      setLoading(false)
      return
    }

    const { error } =
      await supabase
        .from('unit_members')
        .insert({
          unit_id: unitId,
          user_id: userId,
          role,
          start_date:
            startDate || null,
        })

    if (error) {
      console.error(
        'Error asignando persona:',
        error
      )

      if (error.code === '23505') {
        setErrorMessage(
          'Esta persona ya tiene ese rol en esta unidad.'
        )
      } else {
        setErrorMessage(
          'No fue posible asignar la persona.'
        )
      }

      setLoading(false)
      return
    }

    router.push(
      `/superadmin/buildings/${buildingId}/units/${unitId}/members`
    )

    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 650,
        padding: 32,
        backgroundColor:
          '#ffffff',
        borderRadius: 16,
        border:
          '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          marginBottom: 22,
        }}
      >
        <label
          htmlFor="person"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Persona *
        </label>

        <select
          id="person"
          value={userId}
          onChange={(event) =>
            setUserId(
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
          }}
        >
          <option value="">
            Selecciona una persona
          </option>

          {profiles.map(
            (profile) => (
              <option
                key={profile.id}
                value={profile.id}
              >
                {profile.full_name ||
                  'Sin nombre'}
                {' — '}
                {profile.email ||
                  'Sin correo'}
              </option>
            )
          )}
        </select>
      </div>

      <div
        style={{
          marginBottom: 22,
        }}
      >
        <label
          htmlFor="role"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Rol en la unidad *
        </label>

        <select
          id="role"
          value={role}
          onChange={(event) =>
            setRole(
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

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <label
          htmlFor="startDate"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Fecha de inicio
        </label>

        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(event) =>
            setStartDate(
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
          }}
        />
      </div>

      <div
        style={{
          padding: 16,
          marginBottom: 24,
          backgroundColor:
            '#f9fafb',
          borderRadius: 10,
        }}
      >
        <strong>
          {role === 'owner'
            ? 'Propietario'
            : 'Residente'}
        </strong>

        <p
          style={{
            marginBottom: 0,
            color: '#6b7280',
          }}
        >
          {role === 'owner'
            ? 'Representa al propietario de esta unidad.'
            : 'Representa a una persona que reside actualmente en esta unidad.'}
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            backgroundColor:
              '#fee2e2',
            color: '#991b1b',
            borderRadius: 10,
          }}
        >
          {errorMessage}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 12,
        }}
      >
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            router.push(
              `/superadmin/buildings/${buildingId}/units/${unitId}/members`
            )
          }
          style={{
            padding:
              '13px 18px',
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
            backgroundColor:
              '#ffffff',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding:
              '13px 18px',
            borderRadius: 10,
            border: 0,
            backgroundColor:
              '#111827',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading
            ? 'Asignando...'
            : 'Asignar persona'}
        </button>
      </div>
    </form>
  )
}