import { Tabs } from 'expo-router'

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
        }}
      />
    </Tabs>
  )
}