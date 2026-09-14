'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

type Props = {
  userId: string
  email: string
  initialFullName: string
  initialPhone: string
}

export default function ProfileForm({
  userId,
  email,
  initialFullName,
  initialPhone,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] =
    useState(initialFullName)

  const [phone, setPhone] =
    useState(initialPhone)

  const [loading, setLoading] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const cleanName = fullName.trim()
    const cleanPhone = phone.trim()

    if (!cleanName) {
      setErrorMessage(
        'El nombre completo es obligatorio.'
      )
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: cleanName,
        phone: cleanPhone || null,
      })
      .eq('id', userId)

    if (error) {
      console.error(
        'Error actualizando perfil:',
        error
      )

      setErrorMessage(
        'No fue posible actualizar el perfil.'
      )

      setLoading(false)
      return
    }

    setSuccessMessage(
      'Perfil actualizado correctamente.'
    )

    setLoading(false)

    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 650,
        padding: 32,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          marginBottom: 22,
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
            setFullName(event.target.value)
          }
          required
          placeholder="Ej: Francisco Ojeda"
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
          marginBottom: 22,
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
          Correo
        </label>

        <input
          id="email"
          value={email}
          disabled
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: '1px solid #d1d5db',
            fontSize: 16,
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
          }}
        />

        <p
          style={{
            marginBottom: 0,
            color: '#6b7280',
            fontSize: 13,
          }}
        >
          El correo pertenece a tu cuenta de autenticación.
        </p>
      </div>

      <div
        style={{
          marginBottom: 24,
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
            setPhone(event.target.value)
          }
          placeholder="+56 9 1234 5678"
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: '1px solid #d1d5db',
            fontSize: 16,
          }}
        />
      </div>

      {errorMessage && (
        <div
          style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 10,
            backgroundColor: '#fee2e2',
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
            backgroundColor: '#d1fae5',
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
          backgroundColor: '#111827',
          color: '#ffffff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {loading
          ? 'Guardando...'
          : 'Guardar perfil'}
      </button>
    </form>
  )
}