'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '../../../../utils/supabase/client'

export default function BuildingForm() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [rut, setRut] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanAddress = address.trim()
    const cleanRut = rut.trim()

    if (!cleanName) {
      setErrorMessage('El nombre del edificio es obligatorio.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('buildings')
      .insert({
        name: cleanName,
        address: cleanAddress || null,
        rut: cleanRut || null,
      })

    if (error) {
      console.error(error)
      setErrorMessage(
        'No fue posible crear el edificio. Revisa los datos e inténtalo nuevamente.'
      )
      setLoading(false)
      return
    }

    router.push('/superadmin')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 16,
        maxWidth: 650,
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <label
          htmlFor="name"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Nombre del edificio *
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Edificio Parque Central"
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

      <div style={{ marginBottom: 22 }}>
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
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Ej: Av. Providencia 1234, Santiago"
          style={{
            width: '100%',
            padding: 14,
            border: '1px solid #d1d5db',
            borderRadius: 10,
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 26 }}>
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
          type="text"
          value={rut}
          onChange={(event) => setRut(event.target.value)}
          placeholder="Ej: 76.123.456-7"
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
          onClick={() => router.push('/superadmin')}
          disabled={loading}
          style={{
            padding: '14px 20px',
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
            padding: '14px 22px',
            borderRadius: 10,
            border: 0,
            backgroundColor: '#111827',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Creando...' : 'Crear edificio'}
        </button>
      </div>
    </form>
  )
}