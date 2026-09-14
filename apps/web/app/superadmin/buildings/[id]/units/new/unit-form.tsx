'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

type Props = {
  buildingId: string
}

export default function UnitForm({ buildingId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [unitNumber, setUnitNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [proration, setProration] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')

    const cleanUnitNumber = unitNumber.trim()
    const cleanFloor = floor.trim()
    const cleanProration = proration.trim()

    if (!cleanUnitNumber) {
      setErrorMessage('El número de unidad es obligatorio.')
      setLoading(false)
      return
    }

    const parsedProration =
      cleanProration === ''
        ? null
        : Number(cleanProration.replace(',', '.'))

    if (
      parsedProration !== null &&
      Number.isNaN(parsedProration)
    ) {
      setErrorMessage('El prorrateo debe ser un valor numérico.')
      setLoading(false)
      return
    }

    if (
      parsedProration !== null &&
      parsedProration < 0
    ) {
      setErrorMessage('El prorrateo no puede ser negativo.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('units')
      .insert({
        building_id: buildingId,
        unit_number: cleanUnitNumber,
        floor: cleanFloor || null,
        proration: parsedProration,
      })

    if (error) {
      console.error('Error creando unidad:', error)

      if (error.code === '23505') {
        setErrorMessage(
          'Ya existe una unidad con ese número en este edificio.'
        )
      } else {
        setErrorMessage(
          'No fue posible crear la unidad. Inténtalo nuevamente.'
        )
      }

      setLoading(false)
      return
    }

    router.push(`/superadmin/buildings/${buildingId}`)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 650,
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 16,
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
          type="text"
          value={unitNumber}
          onChange={(event) =>
            setUnitNumber(event.target.value)
          }
          placeholder="Ej: 101"
          required
          style={{
            width: '100%',
            padding: 14,
            border: '1px solid #d1d5db',
            borderRadius: 10,
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
          type="text"
          value={floor}
          onChange={(event) =>
            setFloor(event.target.value)
          }
          placeholder="Ej: 1"
          style={{
            width: '100%',
            padding: 14,
            border: '1px solid #d1d5db',
            borderRadius: 10,
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
          type="text"
          inputMode="decimal"
          value={proration}
          onChange={(event) =>
            setProration(event.target.value)
          }
          placeholder="Ej: 0.01250"
          style={{
            width: '100%',
            padding: 14,
            border: '1px solid #d1d5db',
            borderRadius: 10,
            fontSize: 16,
          }}
        />
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
          onClick={() =>
            router.push(
              `/superadmin/buildings/${buildingId}`
            )
          }
          disabled={loading}
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
          {loading ? 'Creando...' : 'Crear unidad'}
        </button>
      </div>
    </form>
  )
}