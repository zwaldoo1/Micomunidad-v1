import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { supabase } from '../lib/supabase'

export default function HomeScreen() {
  const [status, setStatus] = useState('Comprobando configuración...')

  useEffect(() => {
    async function checkSupabase() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        setStatus(`Error: ${error.message}`)
        return
      }

      if (session) {
        setStatus('Usuario autenticado')
      } else {
        setStatus('Supabase configurado - Sin sesión iniciada')
      }
    }

    checkSupabase()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiComunidad</Text>

      <Text style={styles.success}>
        Supabase Mobile ✅
      </Text>

      <Text style={styles.status}>
        {status}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f7fa',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },

  success: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },

  status: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
})