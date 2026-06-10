# Implementation Plan: Gestión de Biohuertos y Parcelas

## Overview

Implementación incremental del módulo **GestorBiohuertos** en BioHuertosApp. El plan extiende el schema de Prisma con eliminación lógica, construye la capa de servicios y validación pura, expone Server Actions con control de acceso, e implementa todos los componentes de UI (Leaflet, Cloudinary, modales, indicadores de área). Cada tarea de implementación va acompañada de sus pruebas de propiedad y/o unitarias correspondientes.

---

## Tasks

- [x] 1. Migración de Schema y Configuración de Base de Datos
  - [x] 1.1 Extender `prisma/schema.prisma` con campos de eliminación lógica y geoespaciales
    - Añadir `activo Boolean @default(true)` y `fechaEliminacion DateTime? @map("fecha_eliminacion")` al modelo `Biohuerto`
    - Añadir `areaGeografica Unsupported("geometry")? @map("area_geografica")` al modelo `Biohuerto`
    - Añadir `activo Boolean @default(true)`, `fechaEliminacion DateTime? @map("fecha_eliminacion")`, `ubicacionGeo Unsupported("geometry")?` y `areaGeografica Unsupported("geometry")? @map("area_geografica")` al modelo `Parcela`
    - Verificar que todos los atributos `@db.Timestamptz(6)`, `@map(...)` y `@db.Uuid` son correctos
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Crear script de migración SQL (`prisma/migrations/add_soft_delete_geo/migration.sql`)
    - Escribir `ALTER TABLE biohuerto ADD COLUMN IF NOT EXISTS area_geografica geometry(Polygon, 4326), ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE, ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMPTZ`
    - Escribir `ALTER TABLE parcela ADD COLUMN IF NOT EXISTS ubicacion_geo geometry(Point, 4326), ADD COLUMN IF NOT EXISTS area_geografica geometry(Polygon, 4326), ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE, ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMPTZ`
    - Verificar que la migración no rompe registros existentes (DEFAULT TRUE asegura compatibilidad)
    - _Requirements: 1.5_

- [x] 2. Tipos/DTOs y Módulo de Validación Pura
  - [x] 2.1 Extender `src/types/index.ts` con los nuevos DTOs del módulo
    - Añadir `BiohuertoDashboardDTO`, `BiohuertDetalleDTO`, `ParcelaDashboardDTO`, `BiohuertFormPayload` y `ParcelaFormPayload` tal como están definidos en el diseño
    - Verificar que `Decimal` se serializa como `number` y `Date` como `string` (ISO) en todos los DTOs
    - _Requirements: 2.2, 7.2_

  - [x] 2.2 Crear `src/lib/validation/biohuertos.ts` con funciones de validación puras
    - Implementar `validarNombre(nombre: string): ValidationResult` — válido si `nombre.trim().length >= 1 && nombre.trim().length <= 100`
    - Implementar `validarArea(area: number): ValidationResult` — válido si `area > 0 && isFinite(area) && !isNaN(area)`
    - Implementar `validarImagenArchivo(tipo: string, tamanioBytes: number): ValidationResult` — válido si `tipo ∈ {image/jpeg, image/png, image/webp}` Y `tamanioBytes <= 5 * 1024 * 1024`
    - Implementar `calcularDisponibilidadArea(areaBiohuerto: number, areasParcelasActivas: number[], areaNueva: number): { valido: boolean; disponible: number }`
    - Exportar `ValidationResult` interface
    - _Requirements: 3.7, 3.8, 8.4, 8.5, 11.1, 11.2, 13.1, 13.4_

  - [x] 2.3 Escribir property test para Propiedad 5 — Validación de Nombre
    - **Propiedad 5: Validación de Nombre — Biohuertos y Parcelas**
    - **Valida: Requirements 3.7, 8.4**
    - Crear `src/lib/validation/__tests__/biohuertos.property.test.ts`
    - Instalar `fast-check` como dev dependency (`pnpm add -D fast-check`) si no está instalada
    - Configurar vitest en `vitest.config.ts` si no existe
    - Test 1: `fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)` → `validarNombre` retorna `{ valido: true }`
    - Test 2: strings de solo espacios → `validarNombre` retorna `{ valido: false, error: string }`
    - Test 3: `fc.string({ minLength: 101, maxLength: 300 })` → `validarNombre` retorna `{ valido: false, error: string }`

  - [x] 2.4 Escribir property test para Propiedad 6 — Validación de Área Positiva
    - **Propiedad 6: Validación de Área — Valor Positivo**
    - **Valida: Requirements 3.8, 8.5**
    - Test 1: `fc.float({ min: 0.01, max: 1e6, noNaN: true })` → `validarArea` retorna `{ valido: true }`
    - Test 2: `fc.float({ max: 0, noNaN: true })` (incluyendo 0 y negativos) → retorna `{ valido: false }`
    - Test 3: NaN e Infinity → retorna `{ valido: false }`

  - [x] 2.5 Escribir property test para Propiedad 7 — Validación de Área de Parcela vs. Biohuerto
    - **Propiedad 7: Validación de Área de Parcela vs. Biohuerto**
    - **Valida: Requirements 8.2, 9.2, 11.1, 11.2**
    - Test 1: cuando `sumaExistentes + areaNueva > areaBiohuerto` → `calcularDisponibilidadArea` retorna `{ valido: false, disponible: X }` donde `X = areaBiohuerto - sumaExistentes`
    - Test 2: cuando `sumaExistentes + areaNueva <= areaBiohuerto` → retorna `{ valido: true }`
    - Test 3: verificar que `disponible` reportado es siempre `areaBiohuerto - sumaExistentes`

  - [x] 2.6 Escribir property test para Propiedad 15 — Validación de Imagen por Tipo y Tamaño
    - **Propiedad 15: Validación de Imagen por Tipo y Tamaño**
    - **Valida: Requirements 13.1, 13.4**
    - Test 1: `fc.constantFrom("image/jpeg", "image/png", "image/webp")` × `fc.integer({ min: 1, max: 5*1024*1024 })` → `validarImagenArchivo` retorna `{ valido: true }`
    - Test 2: tipo inválido (cualquier string fuera del set) × tamaño válido → retorna `{ valido: false }`
    - Test 3: tipo válido × `fc.integer({ min: 5*1024*1024 + 1, max: 15*1024*1024 })` → retorna `{ valido: false }`

- [x] 3. Capa de Servicios — Biohuertos
  - [x] 3.1 Reescribir `src/lib/services/biohuertos.ts` con soporte de eliminación lógica
    - Implementar `listarBiohuertosActivosDeUsuario(duenoId: string): Promise<BiohuertoDashboardDTO[]>` — filtra por `dueno_id = duenoId AND activo = true`, ordena por `fecha_creacion DESC`, extrae `lat/lng` de `ubicacionGeo` vía raw SQL y cuenta `nParcelasActivas`
    - Implementar `obtenerDetallesBiohuerto(id: string, duenoId: string): Promise<BiohuertDetalleDTO | null>` — incluye parcelas activas y extrae vértices del polígono de `area_geografica`
    - Reimplementar `crearBiohuerto(data)` usando `$executeRaw` con `ST_MakePoint` para `ubicacion_geo` y `ST_GeomFromGeoJSON` para `area_geografica`, y retornando el UUID generado
    - Implementar `editarBiohuerto(id: string, data: Partial<BiohuertFormPayload>): Promise<void>` con `$executeRaw` para campos geoespaciales opcionales
    - Implementar `eliminarBiohuerto(id: string): Promise<void>` usando `db.$transaction` — primero `parcela.updateMany({ activo: false, fechaEliminacion: now })`, luego `biohuerto.update({ activo: false, fechaEliminacion: now })`
    - _Requirements: 2.1, 2.5, 3.6, 4.2, 5.2, 5.3, 14.5_

  - [x] 3.2 Escribir property test para Propiedad 1 — Aislamiento de Datos por Usuario
    - **Propiedad 1: Aislamiento de Datos por Usuario — Solo Activos**
    - **Valida: Requirements 2.1, 5.3, 14.5**
    - Crear `src/lib/services/__tests__/biohuertos.property.test.ts`
    - Usar mock de `db` (vitest `vi.mock`) con dataset generado por fast-check
    - `fc.array(fc.record({ duenoId: fc.uuid(), activo: fc.boolean() }))` — verificar que `listarBiohuertosActivosDeUsuario` solo retorna registros con `duenoId === userId && activo === true`

  - [x] 3.3 Escribir property test para Propiedad 2 — Ordenamiento por Fecha
    - **Propiedad 2: Ordenamiento de Listado por Fecha**
    - **Valida: Requirements 2.5**
    - Test: para cualquier lista de N ≥ 2 biohuertos retornada con fechas arbitrarias, verificar que para todo índice `i`, `list[i].fechaCreacion >= list[i+1].fechaCreacion`

  - [x] 3.4 Escribir property test para Propiedad 3 — Invariante de Creación de Biohuerto
    - **Propiedad 3: Invariante de Creación — Campos de Estado Correctos**
    - **Valida: Requirements 3.6**
    - Verificar que cualquier payload de creación válido resulta en un registro con `activo = true`, `duenoId = userId` y `fechaEliminacion = null`
    - Usar mock de `db.$executeRaw` capturando los parámetros pasados

  - [x] 3.5 Escribir property test para Propiedad 8 — Eliminación en Cascada
    - **Propiedad 8: Eliminación Lógica en Cascada — Biohuerto y Parcelas**
    - **Valida: Requirements 5.2**
    - Test: para cualquier biohuerto con N ≥ 0 parcelas activas, tras `eliminarBiohuerto`, verificar que la transacción setea `activo=false` y `fechaEliminacion≠null` en biohuerto Y en todas sus parcelas activas
    - Usar mock de `db.$transaction` e inspeccionar las operaciones ejecutadas

- [ ] 4. Capa de Servicios — Parcelas
  - [x] 4.1 Crear `src/lib/services/parcelas.ts` con CRUD completo
    - Implementar `listarParcelasActivas(biohuertoId: string): Promise<ParcelaDashboardDTO[]>` — filtra por `biohuerto_id AND activo = true`, extrae coordenadas geoespaciales opcionales y cuenta `nCultivosActivos`
    - Implementar `validarAreaParcela(biohuertoId: string, areaMetrosCuadrados: number, parcelaIdExcluida?: string): Promise<{ valido: boolean; disponible: number }>` — hace `SELECT SUM(area) FROM parcela WHERE biohuerto_id = ? AND activo = true AND id != excluida` y `SELECT area_metros_cuadrados FROM biohuerto WHERE id = ?`
    - Implementar `crearParcela(data: ParcelaFormPayload): Promise<string>` usando `$executeRaw` con `ST_MakePoint` y `ST_GeomFromGeoJSON` opcionales, retornando UUID
    - Implementar `editarParcela(id: string, data: Partial<ParcelaFormPayload>): Promise<void>`
    - Implementar `eliminarParcela(id: string): Promise<void>` — `parcela.update({ activo: false, fechaEliminacion: now })`
    - _Requirements: 7.1, 8.3, 8.7, 9.3, 10.2, 11.1_

  - [ ] 4.2 Escribir property test para Propiedad 4 — Invariante de Creación de Parcela
    - **Propiedad 4: Invariante de Creación de Parcela — Campos de Estado Correctos**
    - **Valida: Requirements 8.3**
    - Verificar que cualquier payload de creación válido resulta en `activo = true`, `biohuertoId = B.id` y `fechaEliminacion = null`
    - Crear `src/lib/services/__tests__/parcelas.property.test.ts`

  - [ ] 4.3 Escribir property test para Propiedad 9 — Eliminación Lógica de Parcela Individual
    - **Propiedad 9: Eliminación Lógica de Parcela Individual**
    - **Valida: Requirements 10.2**
    - Test: tras `eliminarParcela(P.id)`, verificar que solo `P` queda con `activo=false` y `fechaEliminacion≠null`; las demás parcelas del mismo biohuerto no se ven afectadas
    - Generar con fast-check N parcelas activas, eliminar una aleatoria, verificar invariante sobre el resto

  - [ ] 4.4 Escribir property test para Propiedad 12 — Aislamiento de Parcelas Activas
    - **Propiedad 12: Aislamiento de Parcelas Activas**
    - **Valida: Requirements 7.1, 10.3**
    - `fc.array(fc.record({ biohuertoId: fc.constant("B1"), activo: fc.boolean() }))` — verificar que `listarParcelasActivas` retorna solo registros con `activo === true`
    - Verificar que `validarAreaParcela` también excluye parcelas inactivas del cálculo de suma

- [ ] 5. Checkpoint — Servicios y Validaciones
  - Asegurarse de que todos los tests de los pasos 2, 3 y 4 pasan antes de continuar con la UI.
  - Ejecutar `pnpm test --run` para verificar las pruebas de propiedad y unitarias de la capa de servicios.
  - Consultar al usuario si surgen dudas sobre la estructura de consultas PostGIS.

- [ ] 6. Server Actions
  - [ ] 6.1 Reescribir `src/actions/biohuertos.ts` con el conjunto completo de actions del módulo
    - Implementar `getBiohuertosDelUsuario()` — lee cookie `bioned_session`, verifica usuario, llama `listarBiohuertosActivosDeUsuario`, retorna `{ data }` o `{ error }`
    - Implementar `getBiohuertoPorIdAction(id: string)` — verifica sesión, llama `obtenerDetallesBiohuerto(id, userId)`, retorna 404 si no encontrado o no pertenece al usuario
    - Reimplementar `crearBiohuertAction(payload: BiohuertFormPayload)` — verifica sesión, valida con `validarNombre`/`validarArea`, sube imagen si hay `fotoBase64`, llama `crearBiohuerto`, retorna `{ data: BiohuertoDashboardDTO }` o `{ error }`
    - Implementar `editarBiohuertAction(id: string, payload: Partial<BiohuertFormPayload>)` — verifica sesión, verifica `dueno_id === userId`, valida campos, llama `editarBiohuerto`
    - Implementar `eliminarBiohuertAction(id: string)` — verifica sesión, verifica `dueno_id === userId`, llama `eliminarBiohuerto`
    - _Requirements: 3.6, 3.7, 3.8, 4.2, 4.5, 5.2, 5.4, 14.1, 14.2, 14.3_

  - [ ] 6.2 Crear `src/actions/parcelas.ts` con CRUD de parcelas
    - Implementar `getParcelasAction(biohuertoId: string)` — verifica sesión, llama `listarParcelasActivas`
    - Implementar `crearParcelaAction(payload: ParcelaFormPayload)` — verifica sesión, verifica propiedad del biohuerto padre, llama `validarAreaParcela`, luego `crearParcela`; retorna `{ data: ParcelaDashboardDTO }` o `{ error: "Área insuficiente. Disponible: X m²" }`
    - Implementar `editarParcelaAction(id: string, payload: Partial<ParcelaFormPayload>)` — verifica sesión, verifica propiedad del biohuerto padre (via join), llama `validarAreaParcela` con `parcelaIdExcluida`, llama `editarParcela`
    - Implementar `eliminarParcelaAction(id: string)` — verifica sesión, verifica propiedad del biohuerto padre, llama `eliminarParcela`
    - _Requirements: 8.3, 9.3, 10.2, 11.1, 11.2, 14.1, 14.2, 14.4_

  - [ ] 6.3 Escribir property test para Propiedad 10 — Control de Acceso en Mutaciones
    - **Propiedad 10: Control de Acceso — Operaciones de Mutación**
    - **Valida: Requirements 4.5, 5.4, 9.4, 10.4, 14.3, 14.4**
    - Crear `src/actions/__tests__/biohuertos.property.test.ts`
    - Usar `vi.mock` para simular un biohuerto con `dueno_id ≠ userId` autenticado
    - `fc.uuidV(4)` para generar IDs arbitrarios distintos — verificar que `editarBiohuertAction` y `eliminarBiohuertAction` retornan `{ error: "No autorizado" }` sin ejecutar escrituras en BD
    - Aplicar mismo patrón para `editarParcelaAction` y `eliminarParcelaAction`

  - [ ] 6.4 Escribir property test para Propiedad 11 — Autenticación Obligatoria
    - **Propiedad 11: Autenticación Obligatoria en Server Actions**
    - **Valida: Requirements 14.1, 14.2**
    - Crear `src/actions/__tests__/parcelas.property.test.ts`
    - Mockear `cookies()` para retornar cookie ausente o valor inválido
    - Verificar que todas las actions del módulo retornan `{ error: "No autenticado" }` sin realizar ninguna llamada a la base de datos
    - Usar `fc.oneof(fc.constant(undefined), fc.string({ minLength: 1 }))` para generar valores de cookie inválidos

- [ ] 7. Componentes Base de UI (sin estado del formulario)
  - [ ] 7.1 Crear `src/components/biohuertos/ConfirmDialog.tsx`
    - Implementar `ConfirmDialogProps` con `open`, `title`, `message`, `onConfirm`, `onCancel`, `loading?`
    - Renderizar overlay modal con Tailwind CSS 4: fondo oscuro, card centrada, botones "Confirmar" y "Cancelar"
    - Mostrar spinner en botón "Confirmar" cuando `loading = true`, deshabilitar ambos botones
    - Asequible: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
    - _Requirements: 5.1, 10.1_

  - [ ] 7.2 Crear `src/components/biohuertos/AreaUsageIndicator.tsx`
    - Implementar `AreaUsageIndicatorProps` con `areaTotal: number` y `parcelasActivas: { areaMetrosCuadrados: number }[]`
    - Calcular `sumaUsada = parcelasActivas.reduce((acc, p) => acc + p.areaMetrosCuadrados, 0)`
    - Calcular `porcentaje = Math.min((sumaUsada / areaTotal) * 100, 100)`
    - Renderizar barra de progreso (`<progress>` nativa o `div` con Tailwind) + texto `"X.XX m² usados de Y.YY m² (Z%)"` 
    - Colorear barra: verde si < 80%, amarillo si 80–99%, rojo si ≥ 100%
    - _Requirements: 6.4, 11.4_

  - [ ] 7.3 Escribir property test para Propiedad 13 — Consistencia del Indicador de Área
    - **Propiedad 13: Consistencia del Indicador de Uso de Área**
    - **Valida: Requirements 6.4, 11.4**
    - Crear `src/components/biohuertos/__tests__/AreaUsageIndicator.property.test.ts`
    - `fc.array(fc.float({ min: 0.01, max: 500, noNaN: true }), { minLength: 0, maxLength: 20 })` + `fc.float({ min: 1, max: 5000, noNaN: true })` para `areaTotal`
    - Verificar que `sumaUsada / areaTotal` es siempre el ratio correcto (con tolerancia `toBeCloseTo`)
    - Verificar que `porcentaje` nunca supera 100 en la barra visual aunque la suma exceda el total

  - [ ] 7.4 Crear `src/components/biohuertos/ImageUploader.tsx`
    - Implementar `ImageUploaderProps` con `currentUrl?`, `onImageReady(base64: string)`, `onImageClear()`
    - Input `type="file"` con `accept="image/jpeg,image/png,image/webp"`
    - Al cambiar, llamar `validarImagenArchivo(file.type, file.size)` del módulo de validación; mostrar error si inválido
    - Si válido: leer como base64 con `FileReader.readAsDataURL`, llamar `onImageReady(base64)`
    - Mostrar `<img>` preview con `currentUrl` o URL local generada con `URL.createObjectURL`
    - Botón "Quitar imagen" llama `onImageClear()`
    - _Requirements: 13.1, 13.4, 13.5_

  - [ ] 7.5 Crear `src/components/biohuertos/MapaInteractivo.tsx`
    - Aplicar `"use client"` y fix de íconos Leaflet (igual que `FarmMap.tsx`: `delete (L.Icon.Default.prototype as any)._getIconUrl`)
    - Añadir `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />` vía `useEffect`
    - Implementar `MapaInteractivoProps` completo: `initialLat?`, `initialLng?`, `initialPoligono?`, `onMarkerChange`, `onMarkerClear`, `onPolygonChange`, `onPolygonClear`, `readonly?`, `className?`
    - Modo marcador: click único en el mapa posiciona/mueve marcador, llama `onMarkerChange(lat, lng)`
    - Modo polígono: clicks sucesivos agregan vértices, doble-clic cierra polígono, llama `onPolygonChange(vertices)`
    - Botones toolbar "Marcador" / "Polígono" / "Limpiar" con Tailwind
    - En `readonly = true`: deshabilitar interacción, solo visualizar marcador y polígono existentes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 7.6 Escribir property test para Propiedad 14 — Captura de Coordenadas del Mapa
    - **Propiedad 14: Captura de Coordenadas del Mapa**
    - **Valida: Requirements 3.3, 3.4, 12.3, 12.4, 12.5**
    - Crear `src/components/biohuertos/__tests__/MapaInteractivo.property.test.ts`
    - Testear la lógica pura de actualización de estado (extraer `useMapState` hook si aplica)
    - `fc.tuple(fc.float({ min: -90, max: 90, noNaN: true }), fc.float({ min: -180, max: 180, noNaN: true }))` — verificar que `onMarkerChange` recibe exactamente `(lat, lng)` sin transformación
    - Verificar que tras `onMarkerClear`, el estado retorna a `null`
    - `fc.array(fc.tuple(...), { minLength: 3, maxLength: 20 })` para polígonos — verificar que `onPolygonChange` recibe exactamente los vértices sin modificación

- [ ] 8. Componentes de Cards y Lista de Biohuertos
  - [ ] 8.1 Crear `src/components/biohuertos/BiohuertCard.tsx`
    - Implementar `BiohuertCardProps` con `biohuerto: BiohuertoDashboardDTO`, `onEdit`, `onDelete`
    - Mostrar: imagen de portada (`<Image>` de Next.js con `placeholder="blur"` o imagen por defecto), nombre, dirección, área en m², número de parcelas activas
    - Botones "Editar" y "Eliminar" — llaman `onEdit(biohuerto)` y `onDelete(biohuerto.id)`
    - Link a `/dashboard/biohuertos/[id]` sobre el área principal de la card
    - Asequible: botones con `aria-label` descriptivo
    - _Requirements: 2.2, 6.1_

  - [ ] 8.2 Crear `src/components/biohuertos/BiohuertosListClient.tsx`
    - Aplicar `"use client"`
    - Implementar estado interno: `biohuertos`, `showForm`, `editingBiohuerto`, `deletingId`, `loading`
    - Estado vacío: cuando `biohuertos.length === 0`, mostrar mensaje y botón "Crear Biohuerto"
    - Botón "Nuevo Biohuerto" abre `BiohuertFormModal` (showForm=true)
    - Al clic "Editar" en card: setear `editingBiohuerto` y abrir modal
    - Al clic "Eliminar" en card: mostrar `ConfirmDialog`; al confirmar, llamar `eliminarBiohuertAction(id)`, actualizar lista local sin recargar
    - Al `onSuccess` del modal: actualizar lista local (insertar nuevo o reemplazar editado)
    - _Requirements: 2.3, 2.4, 4.6, 5.3, 5.5_

- [ ] 9. Componente FormModal de Biohuerto
  - [ ] 9.1 Crear `src/components/biohuertos/BiohuertFormModal.tsx`
    - Aplicar `"use client"`
    - Importar `MapaInteractivo` con `next/dynamic(() => import("./MapaInteractivo"), { ssr: false })`
    - Implementar `BiohuertFormModalProps` y `BiohuertFormState` como especificados en el diseño
    - Modo edición: pre-cargar formulario con valores de `biohuerto` prop (nombre, descripción, dirección, área, lat, lng, polígono, fotoPortadaUrl)
    - Integrar `ImageUploader`: al `onImageReady(base64)`, llamar `POST /api/upload` con `{ image: base64, tipo: "biohuerto" }` y guardar URL en estado
    - Integrar `MapaInteractivo`: manejar `onMarkerChange`, `onMarkerClear`, `onPolygonChange`, `onPolygonClear` → actualizar `BiohuertFormState`
    - Validar con `validarNombre` y `validarArea` antes de submit; mostrar errores inline
    - Al submit: llamar `crearBiohuertAction` o `editarBiohuertAction` según modo; en éxito llamar `onSuccess(biohuerto)`
    - Si falla upload de imagen: mostrar error pero preservar todos los demás campos del formulario
    - _Requirements: 3.1, 3.2, 3.5, 3.7, 3.8, 3.9, 4.1, 4.3, 4.4, 13.2, 13.3_

- [ ] 10. Componentes de Detalle de Biohuerto y Parcelas
  - [ ] 10.1 Crear `src/components/biohuertos/ParcelaCard.tsx`
    - Implementar `ParcelaCardProps` con `parcela: ParcelaDashboardDTO`, `onEdit`, `onDelete`
    - Mostrar: nombre identificador, área en m², tipo de suelo (si existe), número de cultivos activos
    - Botones "Editar" y "Eliminar" con `aria-label` descriptivo
    - _Requirements: 7.2_

  - [ ] 10.2 Crear `src/components/biohuertos/ParcelaFormModal.tsx`
    - Aplicar `"use client"`
    - Importar `MapaInteractivo` dinámicamente con `ssr: false`
    - Implementar formulario con campos: nombre identificador, área m², tipo de suelo (opcional), mapa opcional
    - Validar nombre con `validarNombre` y área con `validarArea`
    - Validación cliente de área: calcular `sumaActivas + areaNueva > areaBiohuerto` usando `calcularDisponibilidadArea` y mostrar error inmediato
    - Al submit: llamar `crearParcelaAction` o `editarParcelaAction`; manejar error `AREA_INSUFICIENTE` del servidor mostrando área disponible
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 9.1, 9.2, 11.3_

  - [ ] 10.3 Crear `src/components/biohuertos/ParcelasListClient.tsx`
    - Aplicar `"use client"`
    - Implementar `ParcelasListClientProps` con `parcelas`, `biohuertoId`, `areaBiohuerto`, `onParcelasChange`
    - Estado vacío: mostrar "No hay parcelas" + botón "Agregar Parcela"
    - Al crear/editar/eliminar parcela: actualizar estado local, llamar `onParcelasChange(nuevaLista)` para que `BiohuertDetailClient` recalcule el `AreaUsageIndicator`
    - Eliminación: mostrar `ConfirmDialog`, al confirmar llamar `eliminarParcelaAction(id)`
    - _Requirements: 7.1, 7.3, 8.6, 9.5, 10.1, 10.5, 11.4_

  - [ ] 10.4 Crear `src/components/biohuertos/BiohuertDetailClient.tsx`
    - Aplicar `"use client"`
    - Implementar `BiohuertDetailClientProps` con `biohuerto: BiohuertDetalleDTO`
    - Mostrar: nombre, descripción, dirección, área total, foto portada (si existe)
    - Renderizar `MapaInteractivo` en modo `readonly` con marcador y polígono del biohuerto
    - Renderizar `AreaUsageIndicator` usando `parcelas` (estado local, sincronizado con `ParcelasListClient`)
    - Mantener `parcelas` en estado local; `ParcelasListClient` llama `onParcelasChange` para sincronizar
    - Botones "Editar Biohuerto" y "Eliminar Biohuerto" en la cabecera
    - _Requirements: 6.2, 6.4_

- [ ] 11. Páginas de Next.js
  - [ ] 11.1 Actualizar `src/app/(dashboard)/biohuertos/page.tsx`
    - Server Component: leer cookie `bioned_session`, obtener `usuarioId`, llamar `listarBiohuertosActivosDeUsuario(usuarioId)`
    - Si no hay sesión activa: redirigir a `/login` con `redirect()`
    - Pasar `biohuertos` y `usuarioId` a `<BiohuertosListClient>`
    - Usar `Suspense` con skeleton si aplica
    - _Requirements: 2.1, 2.4_

  - [ ] 11.2 Actualizar `src/app/(dashboard)/biohuertos/[id]/page.tsx`
    - Server Component: leer sesión, llamar `obtenerDetallesBiohuerto(params.id, usuarioId)`
    - Si no encontrado o no pertenece al usuario: `redirect("/dashboard/biohuertos")` con mensaje de error (via `searchParams` o toast)
    - Pasar `biohuerto: BiohuertDetalleDTO` a `<BiohuertDetailClient>`
    - _Requirements: 6.1, 6.3_

- [ ] 12. Checkpoint Final — Integración Completa
  - Ejecutar `pnpm test --run` para verificar que todos los property tests y unit tests pasan.
  - Verificar que `pnpm build` (TypeScript) compila sin errores.
  - Consultar al usuario si quedan dudas sobre comportamiento de UI o flujos de autorización.

## Notes

- Las tareas marcadas con `*` son opcionales para un MVP más rápido, pero cubren las 15 propiedades de corrección del diseño
- Vitest es el test runner recomendado por el ecosistema Next.js/pnpm; instalar con `pnpm add -D vitest @vitejs/plugin-react`
- `fast-check` se instala con `pnpm add -D fast-check`
- Los mocks de Prisma en tests de propiedad usan `vi.mock("@/lib/db")` para inyectar datasets generados
- Las funciones PostGIS (`ST_MakePoint`, `ST_GeomFromGeoJSON`, `ST_AsGeoJSON`) se usan via `db.$queryRaw` / `db.$executeRaw` ya que Prisma no las soporta de forma tipada
- `MapaInteractivo` siempre se importa con `next/dynamic(..., { ssr: false })` para evitar errores de hidratación de Leaflet
- La transacción de eliminación en cascada en `eliminarBiohuerto` garantiza atomicidad (Property 8)
- Todas las Server Actions verifican autenticación ANTES de cualquier query a BD (Property 11)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.5", "2.6"] },
    { "id": 3, "tasks": ["3.1", "4.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.2", "4.3", "4.4"] },
    { "id": 5, "tasks": ["6.1", "6.2"] },
    { "id": 6, "tasks": ["6.3", "6.4"] },
    { "id": 7, "tasks": ["7.1", "7.2", "7.4", "7.5"] },
    { "id": 8, "tasks": ["7.3", "7.6"] },
    { "id": 9, "tasks": ["8.1", "10.1"] },
    { "id": 10, "tasks": ["8.2", "10.2"] },
    { "id": 11, "tasks": ["9.1", "10.3"] },
    { "id": 12, "tasks": ["10.4"] },
    { "id": 13, "tasks": ["11.1", "11.2"] }
  ]
}
```
