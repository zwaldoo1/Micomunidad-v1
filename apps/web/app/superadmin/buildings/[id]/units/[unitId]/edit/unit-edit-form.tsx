'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

type Props = {
  buildingId: string
  unitId: string
  initialUnitNumber: string
  initialFloor: string
  initialProration: string
  initialActive: boolean
}

export default function UnitEditForm({
  buildingId,
  unitId,
  initialUnitNumber,
  initialFloor,
  initialProration,
  initialActive,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [unitNumber, setUnitNumber] =
    useState(initialUnitNumber)

  const [floor, setFloor] =
    useState(initialFloor)

  const [proration, setProration] =
    useState(initialProration)

  const [active, setActive] =
    useState(initialActive)

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

    const cleanUnitNumber = unitNumber.trim()
    const cleanFloor = floor.trim()
    const cleanProration = proration.trim()

    if (!cleanUnitNumber) {
      setErrorMessage(
        'El número de unidad es obligatorio.'
      )
      setLoading(false)
      return
    }

    const parsedProration =
      cleanProration === ''
        ? null
        : Number(
            cleanProration.replace(',', '.')
          )

    if (
      parsedProration !== null &&
      Number.isNaN(parsedProration)
    ) {
      setErrorMessage(
        'El prorrateo debe ser un valor numérico.'
      )
      setLoading(false)
      return
    }

    if (
      parsedProration !== null &&
      parsedProration < 0
    ) {
      setErrorMessage(
        'El prorrateo no puede ser negativo.'
      )
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('units')
      .update({
        unit_number: cleanUnitNumber,
        floor: cleanFloor || null,
        proration: parsedProration,
        active,
      })
      .eq('id', unitId)
      .eq('building_id', buildingId)

    if (error) {
      console.error(
        'Error actualizando unidad:',
        error
      )

      if (error.code === '23505') {
        setErrorMessage(
          'Ya existe otra unidad con ese número.'
        )
      } else {
        setErrorMessage(
          'No fue posible actualizar la unidad.'
        )
      }

      setLoading(false)
      return
    }

    router.push(
      `/superadmin/buildings/${buildingId}/units/${unitId}`
    )

    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        maxWidth: 650,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="unitNumber"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Número de unidad *
        </label>

        <input
          id="unitNumber"
          value={unitNumber}
          onChange={(event) =>
            setUnitNumber(event.target.value)
          }
          required
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="floor"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Piso
        </label>

        <input
          id="floor"
          value={floor}
          onChange={(event) =>
            setFloor(event.target.value)
          }
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="proration"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Prorrateo
        </label>

        <input
          id="proration"
          inputMode="decimal"
          value={proration}
          onChange={(event) =>
            setProration(event.target.value)
          }
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      <div
        style={{
          marginBottom: 26,
          padding: 18,
          borderRadius: 12,
          backgroundColor: '#f9fafb',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={active}
            onChange={(event) =>
              setActive(event.target.checked)
            }
          />

          <span>
            Unidad activa
          </span>
        </label>

        <p
          style={{
            marginBottom: 0,
            color: '#6b7280',
            fontSize: 14,
          }}
        >
          Desmarca esta opción para desactivar
          la unidad sin eliminar su historial.
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 10,
            backgroundColor: '#fee2e2',
            color: '#991b1b',
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
              `/superadmin/buildings/${buildingId}/units/${unitId}`
            )
          }
          style={{
            padding: '13px 18px',
            borderRadius: 10,
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '13px 18px',
            borderRadius: 10,
            border: 0,
            backgroundColor: '#111827',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading
            ? 'Guardando...'
            : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}