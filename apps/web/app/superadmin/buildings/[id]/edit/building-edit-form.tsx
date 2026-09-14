'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

type Props = {
  buildingId: string
  initialName: string
  initialAddress: string
  initialRut: string
  initialActive: boolean
}

export default function BuildingEditForm({
  buildingId,
  initialName,
  initialAddress,
  initialRut,
  initialActive,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(initialName)
  const [address, setAddress] = useState(initialAddress)
  const [rut, setRut] = useState(initialRut)
  const [active, setActive] = useState(initialActive)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanAddress = address.trim()
    const cleanRut = rut.trim()

    if (!cleanName) {
      setErrorMessage(
        'El nombre del edificio es obligatorio.'
      )
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('buildings')
      .update({
        name: cleanName,
        address: cleanAddress || null,
        rut: cleanRut || null,
        active,
      })
      .eq('id', buildingId)

    if (error) {
      console.error(
        'Error actualizando edificio:',
        error
      )

      setErrorMessage(
        'No fue posible actualizar el edificio.'
      )

      setLoading(false)
      return
    }

    router.push(
      `/superadmin/buildings/${buildingId}`
    )

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
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="name"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Nombre *
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
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
          htmlFor="address"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Dirección
        </label>

        <input
          id="address"
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
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
          htmlFor="rut"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          RUT
        </label>

        <input
          id="rut"
          value={rut}
          onChange={(event) =>
            setRut(event.target.value)
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
          padding: 18,
          marginBottom: 24,
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

          <strong>Edificio activo</strong>
        </label>

        <p
          style={{
            marginBottom: 0,
            color: '#6b7280',
            fontSize: 14,
          }}
        >
          Desactivar el edificio conserva sus unidades,
          residentes y futuro historial financiero.
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: 14,
            borderRadius: 10,
            marginBottom: 20,
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
              `/superadmin/buildings/${buildingId}`
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