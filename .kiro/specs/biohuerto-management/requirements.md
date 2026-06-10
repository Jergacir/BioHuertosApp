# Requirements Document

## Introduction

Este documento describe los requisitos para el módulo de **Gestión de Biohuertos** dentro del dashboard de la aplicación BioHuertosApp. El módulo permite a los usuarios productores crear, visualizar, editar y eliminar (lógicamente) sus biohuertos y las parcelas asociadas a cada uno. La funcionalidad incluye selección geoespacial interactiva mediante mapas (Leaflet), subida de imágenes de portada a Cloudinary, validación de áreas y soporte completo de eliminación lógica mediante campos de estado en la base de datos.

Esta feature extiende el schema existente de Prisma/PostgreSQL añadiendo campos de eliminación lógica (`activo` y `fecha_eliminacion`) a las tablas `biohuerto` y `parcela`, que actualmente no los tienen.

---

## Glossary

- **Biohuerto**: Espacio físico macro registrado por un usuario productor, con ubicación GPS, área geográfica como polígono y área en metros cuadrados.
- **Parcela**: Subdivisión física dentro de un Biohuerto, con su propio nombre, tipo de suelo, área y datos geoespaciales opcionales.
- **Dashboard**: Área privada de la aplicación accesible solo por usuarios autenticados.
- **GestorBiohuertos**: Módulo de la aplicación que administra el ciclo de vida de los Biohuertos y sus Parcelas.
- **GestorParcelas**: Submódulo que administra el ciclo de vida de las Parcelas dentro de un Biohuerto.
- **MapaInteractivo**: Componente de UI basado en Leaflet que permite dibujar polígonos y colocar marcadores de punto GPS.
- **Cloudinary**: Servicio externo de almacenamiento de imágenes utilizado para las fotos de portada.
- **EliminaciónLógica**: Operación que marca un registro como inactivo (`activo = false`) sin borrarlo físicamente de la base de datos.
- **AreaGeografica**: Campo `GEOMETRY(Polygon, 4326)` de PostGIS que representa el contorno del biohuerto o parcela en coordenadas WGS-84.
- **UbicacionGeo**: Campo `GEOMETRY(Point, 4326)` de PostGIS que representa un punto GPS central en coordenadas WGS-84.
- **ServerAction**: Función de Next.js que se ejecuta en el servidor y es invocada directamente desde componentes React.
- **Usuario_Autenticado**: Usuario que ha iniciado sesión y cuya sesión está validada mediante la cookie `bioned_session`.

---

## Requirements

### Requisito 1: Migración del Schema — Campos de Eliminación Lógica

**User Story:** Como desarrollador, quiero agregar soporte de eliminación lógica al schema de base de datos, para que los registros de biohuertos y parcelas nunca se borren físicamente y puedan recuperarse o auditarse.

#### Criterios de Aceptación

1. THE GestorBiohuertos SHALL agregar el campo `activo BOOLEAN NOT NULL DEFAULT TRUE` al modelo `Biohuerto` en `schema.prisma` y en la tabla `biohuerto` de PostgreSQL.
2. THE GestorBiohuertos SHALL agregar el campo `fecha_eliminacion TIMESTAMP WITH TIME ZONE` (nullable) al modelo `Biohuerto` en `schema.prisma` y en la tabla `biohuerto`.
3. THE GestorParcelas SHALL agregar el campo `activo BOOLEAN NOT NULL DEFAULT TRUE` al modelo `Parcela` en `schema.prisma` y en la tabla `parcela`.
4. THE GestorParcelas SHALL agregar el campo `fecha_eliminacion TIMESTAMP WITH TIME ZONE` (nullable) al modelo `Parcela` en `schema.prisma` y en la tabla `parcela`.
5. WHEN se ejecuta la migración de Prisma, THE GestorBiohuertos SHALL aplicar los nuevos campos sin afectar los registros existentes, asignando `activo = true` y `fecha_eliminacion = NULL` a todos los registros previos.

---

### Requisito 2: Listado de Biohuertos del Usuario Autenticado

**User Story:** Como usuario productor, quiero ver una lista de mis biohuertos en forma de cards al ingresar a la sección "Biohuertos" del dashboard, para tener una visión general de mis espacios de cultivo.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado navega a `/dashboard/biohuertos`, THE GestorBiohuertos SHALL recuperar y mostrar únicamente los Biohuertos cuyo `dueno_id` coincida con el `id` del Usuario_Autenticado y cuyo campo `activo` sea `true`.
2. THE GestorBiohuertos SHALL mostrar cada Biohuerto activo como una card que incluye: foto de portada (o imagen placeholder si no existe), nombre del huerto, dirección, área en m² y número de parcelas activas asociadas.
3. WHEN el Usuario_Autenticado no tiene Biohuertos activos registrados, THE GestorBiohuertos SHALL mostrar un estado vacío con un mensaje descriptivo y un botón de acción "Crear Biohuerto".
4. WHEN la sesión del usuario no está activa, THE GestorBiohuertos SHALL redirigir al Usuario_Autenticado a la página de login.
5. THE GestorBiohuertos SHALL ordenar las cards de Biohuertos por `fecha_creacion` descendente.

---

### Requisito 3: Creación de Biohuerto

**User Story:** Como usuario productor, quiero crear un nuevo biohuerto registrando su nombre, descripción, dirección, ubicación GPS, área geográfica dibujada en un mapa y foto de portada, para gestionar mi espacio de cultivo en la plataforma.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado activa el formulario de creación, THE GestorBiohuertos SHALL mostrar un formulario con los campos: nombre del huerto (requerido), descripción (opcional), dirección en texto (requerido), área en m² (requerido, valor positivo mayor a 0), y foto de portada (opcional).
2. WHEN el Usuario_Autenticado abre el formulario de creación, THE GestorBiohuertos SHALL renderizar el MapaInteractivo centrado en las coordenadas por defecto del sistema (latitud -6.7349, longitud -79.8397).
3. WHEN el Usuario_Autenticado coloca un marcador en el MapaInteractivo, THE GestorBiohuertos SHALL capturar las coordenadas del punto como `ubicacion_geo` (Point WGS-84).
4. WHEN el Usuario_Autenticado dibuja un polígono en el MapaInteractivo, THE GestorBiohuertos SHALL capturar los vértices del polígono como `area_geografica` (Polygon WGS-84).
5. WHEN el Usuario_Autenticado sube una imagen de portada, THE GestorBiohuertos SHALL cargarla a Cloudinary y almacenar la URL segura resultante en `foto_portada_url`.
6. WHEN el Usuario_Autenticado envía el formulario con todos los campos requeridos válidos, THE GestorBiohuertos SHALL persistir el nuevo Biohuerto en la base de datos con `activo = true`, `dueno_id` del Usuario_Autenticado y `fecha_eliminacion = NULL`.
7. IF el campo `nombre_huerto` está vacío o supera los 100 caracteres, THEN THE GestorBiohuertos SHALL rechazar el envío y mostrar un mensaje de error descriptivo en el campo correspondiente.
8. IF el campo `area_metros_cuadrados` contiene un valor menor o igual a 0 o no es un número válido, THEN THE GestorBiohuertos SHALL rechazar el envío y mostrar un mensaje de error descriptivo.
9. WHEN el Biohuerto es creado exitosamente, THE GestorBiohuertos SHALL refrescar la lista de cards e incorporar el nuevo Biohuerto sin recargar la página completa.

---

### Requisito 4: Edición de Biohuerto

**User Story:** Como usuario productor, quiero editar los datos de un biohuerto existente, para corregir información o actualizar su descripción, área o foto de portada.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado selecciona "Editar" en una card de Biohuerto, THE GestorBiohuertos SHALL abrir un formulario pre-cargado con los valores actuales del Biohuerto seleccionado.
2. WHEN el Usuario_Autenticado modifica y envía el formulario de edición, THE GestorBiohuertos SHALL actualizar únicamente los campos modificados del registro Biohuerto en la base de datos.
3. WHEN el formulario de edición se renderiza, THE GestorBiohuertos SHALL mostrar el MapaInteractivo con el marcador y polígono existentes del Biohuerto cargados en su posición actual.
4. WHEN el Usuario_Autenticado actualiza la foto de portada en el formulario de edición, THE GestorBiohuertos SHALL subir la nueva imagen a Cloudinary y reemplazar el valor de `foto_portada_url`.
5. IF el Usuario_Autenticado intenta editar un Biohuerto cuyo `dueno_id` no coincide con su propio `id`, THEN THE GestorBiohuertos SHALL rechazar la operación y retornar un error de autorización.
6. WHEN la edición se completa exitosamente, THE GestorBiohuertos SHALL actualizar la card correspondiente en la lista con los nuevos valores, sin recargar la página completa.

---

### Requisito 5: Eliminación Lógica de Biohuerto

**User Story:** Como usuario productor, quiero eliminar un biohuerto de mi lista, para que deje de aparecer en mi dashboard sin perder el historial de datos.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado selecciona "Eliminar" en una card de Biohuerto, THE GestorBiohuertos SHALL mostrar un diálogo de confirmación indicando que la acción ocultará el biohuerto y sus parcelas.
2. WHEN el Usuario_Autenticado confirma la eliminación, THE GestorBiohuertos SHALL actualizar el registro en la base de datos estableciendo `activo = false` y `fecha_eliminacion = CURRENT_TIMESTAMP` para el Biohuerto y todas sus Parcelas activas asociadas.
3. THE GestorBiohuertos SHALL excluir de forma permanente los registros con `activo = false` de todos los listados y consultas del módulo de gestión.
4. IF el Usuario_Autenticado intenta eliminar un Biohuerto cuyo `dueno_id` no coincide con su propio `id`, THEN THE GestorBiohuertos SHALL rechazar la operación y retornar un error de autorización.
5. WHEN la eliminación lógica se completa exitosamente, THE GestorBiohuertos SHALL remover la card del Biohuerto eliminado de la lista visible sin recargar la página completa.

---

### Requisito 6: Vista de Detalle de Biohuerto y Gestión de Parcelas

**User Story:** Como usuario productor, quiero acceder a la vista de detalle de un biohuerto para gestionar sus parcelas, ver información completa y acceder a las acciones de edición y eliminación.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado hace clic en una card de Biohuerto, THE GestorBiohuertos SHALL navegar a la ruta `/dashboard/biohuertos/[id]` mostrando el detalle completo del Biohuerto.
2. THE GestorBiohuertos SHALL mostrar en la vista de detalle: nombre, descripción, dirección, área total en m², foto de portada (si existe), el MapaInteractivo con el polígono y marcador del Biohuerto, y la lista de Parcelas activas.
3. WHEN el Usuario_Autenticado navega a la vista de detalle de un Biohuerto inactivo (`activo = false`) o que no le pertenece, THE GestorBiohuertos SHALL redirigir al listado de biohuertos y mostrar un mensaje de error.
4. THE GestorBiohuertos SHALL mostrar en la vista de detalle un indicador de uso de área: área total utilizada por las parcelas activas vs. el área total del Biohuerto, expresado en m² y como porcentaje.

---

### Requisito 7: Listado de Parcelas de un Biohuerto

**User Story:** Como usuario productor, quiero ver la lista de parcelas de un biohuerto en su vista de detalle, para conocer la distribución y estado de mis espacios de cultivo.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado accede a la vista de detalle de un Biohuerto, THE GestorParcelas SHALL recuperar y mostrar únicamente las Parcelas cuyo `biohuerto_id` corresponda al Biohuerto activo y cuyo campo `activo` sea `true`.
2. THE GestorParcelas SHALL mostrar cada Parcela como un elemento de lista o card con: nombre identificador, área en m², tipo de suelo (si existe).
3. WHEN el Biohuerto no tiene Parcelas activas registradas, THE GestorParcelas SHALL mostrar un estado vacío con la opción "Agregar Parcela".

---

### Requisito 8: Creación de Parcela

**User Story:** Como usuario productor, quiero crear una parcela dentro de un biohuerto registrando su nombre, área, tipo de suelo y datos geoespaciales opcionales, para organizar el espacio de cultivo por sectores.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado activa el formulario de creación de Parcela en la vista de detalle de un Biohuerto, THE GestorParcelas SHALL mostrar un formulario con los campos: nombre identificador (requerido), área en m² (requerido, valor positivo mayor a 0), tipo de suelo (opcional) y el MapaInteractivo para capturar ubicación y área geográfica opcionales.
2. WHEN el área en m² de la nueva Parcela más el área total de las Parcelas activas existentes del Biohuerto superan el `area_metros_cuadrados` del Biohuerto, THE GestorParcelas SHALL rechazar el envío y mostrar un mensaje de error indicando el área disponible restante.
3. WHEN el Usuario_Autenticado envía el formulario con todos los campos requeridos válidos, THE GestorParcelas SHALL persistir la nueva Parcela con `activo = true`, `biohuerto_id` del Biohuerto padre y `fecha_eliminacion = NULL`.
4. IF el campo `nombre_identificador` está vacío o supera los 100 caracteres, THEN THE GestorParcelas SHALL rechazar el envío y mostrar un mensaje de error descriptivo.
5. IF el campo `area_metros_cuadrados` de la Parcela contiene un valor menor o igual a 0 o no es un número válido, THEN THE GestorParcelas SHALL rechazar el envío y mostrar un mensaje de error descriptivo.
6. WHEN la Parcela es creada exitosamente, THE GestorParcelas SHALL refrescar la lista de Parcelas en la vista de detalle del Biohuerto e incorporar la nueva Parcela sin recargar la página completa.
7. WHEN el Usuario_Autenticado coloca un marcador o dibuja un polígono en el MapaInteractivo del formulario de Parcela, THE GestorParcelas SHALL capturar y almacenar respectivamente `ubicacion_geo` (Point) y `area_geografica` (Polygon) en la Parcela.

---

### Requisito 9: Edición de Parcela

**User Story:** Como usuario productor, quiero editar los datos de una parcela existente, para actualizar su nombre, tipo de suelo, área o datos geoespaciales.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado selecciona "Editar" en una Parcela, THE GestorParcelas SHALL mostrar el formulario de edición pre-cargado con los valores actuales de la Parcela.
2. WHEN el Usuario_Autenticado modifica el área en m² de una Parcela y el nuevo valor más el área de las otras Parcelas activas del mismo Biohuerto supera el `area_metros_cuadrados` del Biohuerto, THE GestorParcelas SHALL rechazar el envío y mostrar el área disponible restante.
3. WHEN el Usuario_Autenticado envía el formulario de edición con datos válidos, THE GestorParcelas SHALL actualizar el registro de la Parcela en la base de datos.
4. IF el Usuario_Autenticado intenta editar una Parcela cuyo Biohuerto padre no le pertenece, THEN THE GestorParcelas SHALL rechazar la operación y retornar un error de autorización.
5. WHEN la edición de la Parcela se completa exitosamente, THE GestorParcelas SHALL actualizar el elemento de lista correspondiente con los nuevos valores sin recargar la página completa.

---

### Requisito 10: Eliminación Lógica de Parcela

**User Story:** Como usuario productor, quiero eliminar lógicamente una parcela de un biohuerto, para que deje de aparecer en la gestión sin perder los datos históricos de cultivos.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado selecciona "Eliminar" en una Parcela, THE GestorParcelas SHALL mostrar un diálogo de confirmación antes de ejecutar la operación.
2. WHEN el Usuario_Autenticado confirma la eliminación, THE GestorParcelas SHALL actualizar la Parcela estableciendo `activo = false` y `fecha_eliminacion = CURRENT_TIMESTAMP`.
3. THE GestorParcelas SHALL excluir los registros de Parcelas con `activo = false` de todos los listados y validaciones de área del módulo.
4. IF el Usuario_Autenticado intenta eliminar una Parcela cuyo Biohuerto padre no le pertenece, THEN THE GestorParcelas SHALL rechazar la operación y retornar un error de autorización.
5. WHEN la eliminación lógica de la Parcela se completa exitosamente, THE GestorParcelas SHALL remover el elemento del listado de Parcelas visible sin recargar la página completa.

---

### Requisito 11: Validación de Área de Parcelas vs. Biohuerto

**User Story:** Como usuario productor, quiero que el sistema valide que el área total de mis parcelas no supere el área de mi biohuerto, para mantener la coherencia de los datos espaciales.

#### Criterios de Aceptación

1. WHEN se crea o edita una Parcela, THE GestorParcelas SHALL calcular la suma de `area_metros_cuadrados` de todas las Parcelas activas del Biohuerto (excluyendo la Parcela editada si aplica) más el área de la Parcela nueva/editada.
2. IF la suma calculada supera el `area_metros_cuadrados` del Biohuerto padre, THEN THE GestorParcelas SHALL rechazar la operación y retornar un mensaje de error que indique el área disponible restante en m².
3. THE GestorParcelas SHALL ejecutar la validación de área tanto en el servidor (ServerAction) como con retroalimentación visual en el cliente antes del envío del formulario.
4. THE GestorParcelas SHALL recalcular y actualizar el indicador de uso de área del Biohuerto en la vista de detalle cada vez que se cree, edite o elimine lógicamente una Parcela.

---

### Requisito 12: Integración del Mapa Interactivo (Leaflet)

**User Story:** Como usuario productor, quiero interactuar con un mapa para dibujar el área de mi biohuerto o parcela y colocar un marcador de ubicación, para que los datos geoespaciales sean precisos y visuales.

#### Criterios de Aceptación

1. THE GestorBiohuertos SHALL renderizar el MapaInteractivo únicamente en el cliente (componente marcado con `"use client"`) utilizando la librería Leaflet ya instalada en el proyecto.
2. WHEN el MapaInteractivo se monta, THE GestorBiohuertos SHALL centrarlo en las coordenadas del Biohuerto si están disponibles, o en las coordenadas por defecto del sistema en caso contrario.
3. WHEN el Usuario_Autenticado coloca un marcador en el MapaInteractivo, THE GestorBiohuertos SHALL actualizar el estado del formulario con las coordenadas del punto (latitud, longitud).
4. WHEN el Usuario_Autenticado dibuja un polígono en el MapaInteractivo, THE GestorBiohuertos SHALL actualizar el estado del formulario con la lista de vértices del polígono en formato GeoJSON.
5. WHEN el Usuario_Autenticado elimina el marcador o el polígono del MapaInteractivo, THE GestorBiohuertos SHALL limpiar los campos `ubicacion_geo` y `area_geografica` correspondientes en el estado del formulario.
6. WHERE el entorno no soporte la renderización del MapaInteractivo (SSR en Next.js), THE GestorBiohuertos SHALL cargar el componente dinámicamente con `next/dynamic` y `ssr: false` para evitar errores de hidratación.

---

### Requisito 13: Subida de Imagen de Portada a Cloudinary

**User Story:** Como usuario productor, quiero subir una foto de portada para mi biohuerto, para que la card muestre una imagen representativa de mi espacio de cultivo.

#### Criterios de Aceptación

1. WHEN el Usuario_Autenticado selecciona un archivo de imagen en el formulario, THE GestorBiohuertos SHALL validar que el archivo sea de tipo imagen (JPEG, PNG, WebP) y tenga un tamaño máximo de 5 MB antes de realizar la subida.
2. WHEN la validación del archivo es exitosa, THE GestorBiohuertos SHALL subir la imagen al servicio Cloudinary utilizando el endpoint `/api/upload` existente en el proyecto y almacenar la URL segura resultante.
3. IF la subida a Cloudinary falla, THEN THE GestorBiohuertos SHALL mostrar un mensaje de error descriptivo y permitir al usuario intentar nuevamente sin perder los demás datos del formulario.
4. IF el archivo no cumple las validaciones de tipo o tamaño, THEN THE GestorBiohuertos SHALL rechazar la selección y mostrar un mensaje de error antes de intentar la subida.
5. THE GestorBiohuertos SHALL mostrar una vista previa de la imagen seleccionada en el formulario antes de confirmar el envío.

---

### Requisito 14: Seguridad y Control de Autorización

**User Story:** Como administrador del sistema, quiero que todas las operaciones CRUD de biohuertos y parcelas validen la identidad y propiedad del usuario autenticado, para prevenir accesos no autorizados.

#### Criterios de Aceptación

1. WHEN cualquier ServerAction del GestorBiohuertos o GestorParcelas es invocada, THE GestorBiohuertos SHALL verificar la presencia y validez de la cookie `bioned_session` antes de ejecutar cualquier operación de base de datos.
2. IF la cookie `bioned_session` no existe o no corresponde a un Usuario_Autenticado válido, THEN THE GestorBiohuertos SHALL rechazar la operación retornando un error `{ error: "No autenticado" }` sin ejecutar ninguna consulta a la base de datos.
3. WHEN se ejecuta una operación de actualización o eliminación sobre un Biohuerto, THE GestorBiohuertos SHALL verificar que el `dueno_id` del Biohuerto coincide con el `id` del Usuario_Autenticado antes de modificar el registro.
4. WHEN se ejecuta una operación de actualización o eliminación sobre una Parcela, THE GestorParcelas SHALL verificar que el `dueno_id` del Biohuerto padre de la Parcela coincide con el `id` del Usuario_Autenticado antes de modificar el registro.
5. THE GestorBiohuertos SHALL filtrar todas las consultas de listado por `dueno_id = id_del_usuario_autenticado` para garantizar el aislamiento de datos entre usuarios.
