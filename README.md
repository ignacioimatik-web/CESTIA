# Cesta Inteligente

Aplicacion web **mobile-first** para convertir recetas en listas de compra operativas por supermercado, secciones fisicas y hogar.

## Que resuelve

- Crear recetas y escalar ingredientes por raciones.
- Generar listas de compra desde recetas, eventos y plantillas.
- Organizar lista por secciones de supermercado.
- Sugerir productos cacheados segun ingredientes.
- Gestionar hogar (adultos, ninos, invitados, presupuesto, preferencias).
- Exportar lista para compra en tienda.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, RLS)
- Framer Motion
- Vercel

## Estado funcional actual

- Dashboard operativo (no decorativo) con bloques funcionales.
- Flujo de recetas, listas, hogar y eventos funcionando.
- PWA base con:
  - manifest,
  - iconos,
  - instalacion movil,
  - cache offline basica,
  - recuperacion local de lista activa.
- Integracion experimental de catalogo (Mercadona) desacoplada por servicio.

## Estructura principal

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/admin/sync/mercadona/
  components/
    dashboard/
    shopping-list/
    shared/
    ui/
  services/supermarkets/mercadona/
  lib/
    supermarkets/
    household/
    matching/
    supabase/
supabase/
  migrations/
  functions/
  seed.sql
public/
  manifest.json
  sw.js
```

## Requisitos

- Node.js 20+
- npm
- Proyecto Supabase

## Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Cesta Inteligente

MERCADONA_SYNC_ENABLED=false
MERCADONA_SYNC_DRY_RUN=true
MERCADONA_SYNC_MAX_CATEGORIES=25
MERCADONA_SYNC_MAX_PRODUCTS_PER_CATEGORY=200
MERCADONA_PUBLIC_API_BASE=https://tienda.mercadona.es/api
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Calidad y build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Base de datos (Supabase)

### Migraciones

- Aplicar en tu proyecto Supabase con CLI o SQL Editor.
- Migraciones relevantes:
  - `00011_fix_signup_household_bootstrap.sql` (alta fiable de usuario/hogar)
  - `00012_experimental_catalog_sync.sql` (base catalogo sincronizado)

### Seed

- `supabase/seed.sql` incluye:
  - supermercados base,
  - categorias,
  - ingredientes,
  - productos ejemplo,
  - 30+ recetas realistas para entorno demo.

## Autenticacion y registro

- Registro en `/(auth)/register`.
- Login en `/(auth)/login` con opcion de reenvio de email de confirmacion.
- El bootstrap de perfil/hogar se hace en trigger DB (`handle_new_user`).

## PWA

- Manifest: `public/manifest.json`
- Service worker: `public/sw.js`
- Registro SW: `src/components/pwa/register-sw.tsx`
- Iconos app:
  - `src/app/icon.tsx`
  - `src/app/apple-icon.tsx`

## Catalogo experimental de supermercado

### Regla de arquitectura

- **Nunca** consultar proveedor desde componentes React.
- Todo acceso externo pasa por servicio/endpoint servidor protegido.

### Servicio

- `src/services/supermarkets/mercadona/MercadonaProvider.ts`
- Funciones:
  - `getSupermarketInfo`
  - `syncCategories`
  - `syncProducts`
  - `normalizeCategory`
  - `normalizeProduct`
  - `mapCategoryToInternalSection`
  - `searchCachedProducts`
  - `getCachedProductByExternalId`

### Endpoint admin protegido

- `POST /api/admin/sync/mercadona`
- Solo admin o entorno no produccion.

### Comportamiento de resiliencia

- Si falla proveedor:
  - log de error,
  - no se rompe app,
  - usa cache o estado pendiente.

## Dashboard

Orden operativo actual:

1. Hero
2. Accion principal: Crear lista
3. Motor de compra
4. Lista activa
5. Hogar
6. Recetas modelo
7. Secciones
8. Eventos
9. Plantillas
10. Estado catalogo

## Principios de producto (obligatorios)

1. No pantallas decorativas sin funcion real.
2. No datos falsos salvo seeds explicitos.
3. No romper funcionalidad existente.
4. No acoplar la app a un solo supermercado.
5. No consultas externas desde React cliente.
6. Integraciones externas via conector/servicio.
7. Persistencia en Supabase.
8. RLS en tablas sensibles.
9. Todo nuevo flujo debe funcionar en movil.
10. Todo boton visible: accion real o deshabilitado con contexto.
11. Evitar deuda tecnica innecesaria.
12. Evitar `any` sin justificacion.
13. No duplicar logica de negocio en componentes.
14. Listas usables con una mano.
15. La app debe degradar bien si falla el proveedor.

## Despliegue

- Produccion en Vercel.
- Asegurar variables de entorno en Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Licencia

Uso interno/proyecto privado (ajustar segun necesidad).
