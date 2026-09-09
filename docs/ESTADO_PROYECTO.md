# MiComunidad — Estado del Proyecto

Última actualización: 08-09-2026

---

## 1. Objetivo

MiComunidad será una plataforma multi-edificio para la gestión de comunidades.

El sistema tendrá:

- Aplicación móvil Android/iOS
- Aplicación web para residentes
- Portal web para administradores
- Panel de superadministración
- Backend centralizado
- Base de datos PostgreSQL
- Sistema de autenticación
- Roles y permisos
- Gestión de edificios
- Gestión de departamentos
- Gastos comunes
- Pagos
- Documentos
- Avisos
- Notificaciones
- Reportes
- Auditoría

---

## 2. Stack tecnológico definido

### Mobile
- React Native
- Expo
- TypeScript
- Expo Router

### Web
- Next.js
- TypeScript
- Tailwind CSS
- App Router

### Backend
- Supabase

### Base de datos
- PostgreSQL

### Autenticación
- Supabase Auth

### Archivos
- Supabase Storage

### Pagos
- Transbank Webpay

### Repositorio
- Git / GitHub

---

## 3. Arquitectura

MiComunidad utiliza arquitectura MONOREPO.

MiComunidad/
│
├── apps/
│   ├── mobile/
│   └── web/
│
├── packages/
│
├── supabase/
│
├── docs/
│
└── package.json

---

## 4. Estado actual

### Estructura principal

- [x] Carpeta MiComunidad creada
- [x] Carpeta apps creada
- [x] apps/mobile creado
- [x] apps/web creado
- [x] docs creado
- [x] packages creado
- [x] supabase creado
- [x] package.json raíz creado

### Web

- [x] Next.js instalado
- [x] TypeScript instalado
- [x] Tailwind instalado
- [x] Aplicación web ejecuta correctamente
- [x] npm run dev funciona
- [x] GET / responde HTTP 200
- [x] page.tsx disponible

### Mobile

- [x] Proyecto Expo creado
- [ ] Verificar ejecución de Expo
- [ ] Verificar aplicación en dispositivo/emulador

### Git

- [x] Repositorio Git detectado
- [ ] Revisar configuración del repositorio
- [ ] Crear repositorio remoto GitHub
- [ ] Conectar origin
- [ ] Crear estrategia de ramas

### Backend

- [ ] Crear proyecto Supabase
- [ ] Configurar variables de entorno
- [ ] Configurar Supabase Web
- [ ] Configurar Supabase Mobile

### Base de datos

- [ ] profiles
- [ ] buildings
- [ ] building_members
- [ ] units
- [ ] unit_members
- [ ] billing_periods
- [ ] expenses
- [ ] expense_items
- [ ] charges
- [ ] payments
- [ ] payment_transactions
- [ ] documents
- [ ] announcements
- [ ] notifications
- [ ] audit_logs

---

## 5. Roles definidos

- superadmin
- admin
- owner
- resident

Roles futuros posibles:

- concierge
- committee
- accountant

---

## 6. Principio multi-edificio

La plataforma NO estará diseñada para un solo edificio.

Cada organización tendrá su propio building_id.

Ejemplo:

Plataforma
│
├── Edificio A
│   ├── Depto 101
│   ├── Depto 102
│   └── Depto 103
│
└── Edificio B
    ├── Depto 101
    ├── Depto 102
    └── Depto 103

Los usuarios solamente podrán visualizar los edificios y departamentos
para los cuales tengan permisos.

---

## 7. Próximo objetivo

Completar infraestructura local antes de desarrollar funcionalidades.

Orden inmediato:

1. Verificar Web
2. Verificar Mobile
3. Revisar package.json raíz
4. Configurar Git correctamente
5. Crear GitHub
6. Crear Supabase
7. Diseñar base de datos
8. Crear primera migración SQL
9. Configurar autenticación
10. Implementar roles y RLS

---

## 8. Regla de desarrollo

Cada módulo deberá completarse siguiendo:

Diseño
↓
Base de datos
↓
Backend
↓
Seguridad
↓
Web
↓
Mobile
↓
Pruebas
↓
Git commit

No avanzar al siguiente módulo dejando incompleto el anterior.

---

## 9. Estado de desarrollo

FASE 01 — Arquitectura             EN PROGRESO
FASE 02 — Git/GitHub               PENDIENTE
FASE 03 — Supabase                 PENDIENTE
FASE 04 — Base de datos            PENDIENTE
FASE 05 — Autenticación            PENDIENTE
FASE 06 — Roles/RLS                PENDIENTE
FASE 07 — Edificios                PENDIENTE
FASE 08 — Departamentos            PENDIENTE
FASE 09 — Residentes               PENDIENTE
FASE 10 — Gastos comunes           PENDIENTE
FASE 11 — Pagos                    PENDIENTE
FASE 12 — Documentos               PENDIENTE
FASE 13 — Avisos                   PENDIENTE
FASE 14 — Notificaciones           PENDIENTE
FASE 15 — Reportes                 PENDIENTE
FASE 16 — Auditoría                PENDIENTE
FASE 17 — Testing                  PENDIENTE
FASE 18 — Staging                  PENDIENTE
FASE 19 — Producción Web           PENDIENTE
FASE 20 — Android                  PENDIENTE
FASE 21 — iOS                      PENDIENTE

---

## 10. Último punto confirmado

La aplicación Next.js ubicada en:

apps/web

se encuentra funcionando mediante:

npm run dev

El servidor devuelve:

GET / 200

Existe una advertencia de desarrollo relacionada con:

allowedDevOrigins

para la dirección:

192.168.100.12

Esta advertencia queda pendiente de configuración.

FASE 06 — Autenticación Web       ✅ COMPLETADA

[x] Login
[x] Sesión Supabase
[x] Validación platform_admin
[x] Protección /superadmin
[x] Dashboard Superadmin
[x] Consulta buildings con RLS

FASE 07 — Gestión de edificios    ← SIGUIENTE

[ ] Listado edificios
[ ] Crear edificio
[ ] Editar edificio
[ ] Desactivar edificio
[ ] Ver detalle edificio