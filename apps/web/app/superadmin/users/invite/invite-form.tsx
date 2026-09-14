'use client'

import { useState } from 'react'
import type {
  FormEvent,
} from 'react'

export default function InviteForm() {
  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

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
              fullName,
              email,
              phone,
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

      setFullName('')
      setEmail('')
      setPhone('')
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
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
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
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
          }}
        />
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
            setPhone(
              event.target.value
            )
          }
          placeholder="+56 9 1234 5678"
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border:
              '1px solid #d1d5db',
          }}
        />
      </div>

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
          padding:
            '13px 18px',
          border: 0,
          borderRadius: 10,
          backgroundColor:
            '#111827',
          color: '#ffffff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {loading
          ? 'Enviando...'
          : 'Enviar invitación'}
      </button>
    </form>
  )
}