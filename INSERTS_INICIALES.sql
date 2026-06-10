-- =========================================================================
-- SCRIPT DE INSERCIÓN DE DATOS COHERENTES (SEED) - BIONED USAT 2026
-- =========================================================================

DO $$
DECLARE
    -- IDs de Roles
    id_rol_admin UUID := gen_random_uuid();
    id_rol_productor UUID := gen_random_uuid();
    id_rol_comprador UUID := gen_random_uuid();
    
    -- IDs de Usuarios Administradores (Tú y tu equipo de la Hackatón)
    id_user_jeremy UUID := gen_random_uuid();
    id_user_rodrigo_admin UUID := gen_random_uuid();
    id_user_yamir UUID := gen_random_uuid();
    id_user_karla UUID := gen_random_uuid();

    -- IDs de Usuarios Productores
    id_user_prod_rodrigo UUID := gen_random_uuid();
    id_user_prod_juan UUID := gen_random_uuid();
    id_user_prod_elena UUID := gen_random_uuid();

    -- IDs de Compradores
    id_user_comp_maria UUID := gen_random_uuid();
    id_user_comp_carlos UUID := gen_random_uuid();

    -- IDs de Biohuertos
    id_huerto_las_brisas UUID := gen_random_uuid();
    id_huerto_pimentel UUID := gen_random_uuid();
    id_huerto_la_victoria UUID := gen_random_uuid();

    -- IDs de Parcelas
    id_parcela_brisas_1 UUID := gen_random_uuid();
    id_parcela_brisas_2 UUID := gen_random_uuid();
    id_parcela_pimentel_1 UUID := gen_random_uuid();
    id_parcela_victoria_1 UUID := gen_random_uuid();

    -- IDs Catálogo Maestro
    id_master_tomate UUID := gen_random_uuid();
    id_master_lechuga UUID := gen_random_uuid();
    id_master_albahaca UUID := gen_random_uuid();
    id_master_espinaca UUID := gen_random_uuid();
    id_master_fresa UUID := gen_random_uuid();

    -- IDs Catálogo de Usuarios
    id_u_planta_tomate UUID := gen_random_uuid();
    id_u_planta_lechuga UUID := gen_random_uuid();
    id_u_planta_albahaca UUID := gen_random_uuid();
    id_u_planta_fresa UUID := gen_random_uuid();

    -- IDs de Cultivos
    id_cultivo_tomate UUID := gen_random_uuid();
    id_cultivo_lechuga UUID := gen_random_uuid();
    id_cultivo_albahaca UUID := gen_random_uuid();
    id_cultivo_fresa UUID := gen_random_uuid();
BEGIN

    -- 1. POBLAR ROLES
    INSERT INTO rol (id, nombre, descripcion) VALUES
    (id_rol_admin, 'ADMIN', 'Administrador de la plataforma de la Escuela de Ingeniería de Sistemas USAT'),
    (id_rol_productor, 'PRODUCTOR', 'Beneficiario del programa RSU Cultivando Salud en Casa con cultivos activos'),
    (id_rol_comprador, 'COMPRADOR', 'Usuario externo, vecino o consumidor final interesado en hortalizas ecológicas');

    -- 2. POBLAR USUARIOS ADMINS (Jeremy, Rodrigo, Yamir)
    INSERT INTO usuario (id, rol_id, nombre_completo, email, telefono, password_hash, foto_perfil_url) VALUES
    (id_user_jeremy, id_rol_admin, 'Jeremy Adrián García Ñañez', 'jeremy.garcia@usat.edu.pe', '920111222', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/admin_jeremy.jpg'),
    (id_user_rodrigo_admin, id_rol_admin, 'Rodrigo Alarcón Mundaca', 'ralarcon@usat.edu.pe', '930222333', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/admin_rodrigo.jpg'),
    (id_user_yamir, id_rol_admin, 'Yamir Pisfil Flores', 'ypisfil@usat.edu.pe', '940333444', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/admin_yamir.jpg'),
    (id_user_karla, id_rol_admin, 'Ing. Karla Reyes Burgos', 'kreyes@usat.edu.pe', '974852163', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/admin_karla.jpg');

    -- POBLAR 3 PRODUCTORES DISTINTOS
    INSERT INTO usuario (id, rol_id, nombre_completo, email, telefono, password_hash, foto_perfil_url) VALUES
    (id_user_prod_rodrigo, id_rol_productor, 'Rodrigo Agroecológico Chiclayo', 'rodrigo.sistemas@gmail.com', '987654321', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/productor_rodrigo.jpg'),
    (id_user_prod_juan, id_rol_productor, 'Juan Pérez Altamirano', 'juan.perez@outlook.com', '963258741', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/productor_juan.jpg'),
    (id_user_prod_elena, id_rol_productor, 'Elena Sullón Ramos', 'elena.sullon@gmail.com', '912345678', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/productor_elena.jpg');

    -- POBLAR COMPRADORES
    INSERT INTO usuario (id, rol_id, nombre_completo, email, telefono, password_hash, foto_perfil_url) VALUES
    (id_user_comp_maria, id_rol_comprador, 'María Elena Delgado', 'maria.elena@outlook.com', '951753468', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/comprador_maria.jpg'),
    (id_user_comp_carlos, id_rol_comprador, 'Carlos Mendoza Ruiz', 'carlos.mendoza@gmail.com', '942751836', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wA5M99H.aW9GZ7W.k2e.i', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/profiles/comprador_carlos.jpg');

    -- 3. POBLAR 3 BIOHUERTOS (Corregido para el estándar CamelCase de Prisma)
    INSERT INTO biohuerto (id, dueno_id, nombre_huerto, descripcion, direccion_texto, "ubicacionGeo", area_metros_cuadrados, foto_portada_url) VALUES
    -- Las Brisas, Chiclayo Norte (-6.77137, -79.83854)
    (id_huerto_las_brisas, id_user_prod_rodrigo, 'Biohuerto Familiar Las Brisas', 'Emprendimiento socioambiental enfocado en hortalizas libres de pesticidas.', 'Av. Las Brisas Mz. F Lote 12, Chiclayo', ST_SetSRID(ST_MakePoint(-79.83854, -6.77137), 4326), 45.50, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/huertos/las_brisas_cover.jpg'),
    -- Pimentel, Cerca a la costa / USAT (-6.76342, -79.87102)
    (id_huerto_pimentel, id_user_prod_juan, 'Huerto Verde Mar - Pimentel', 'Cultivos hidropónicos y camas elevadas aprovechando el clima costero.', 'Calle Los Robles 245, Pimentel', ST_SetSRID(ST_MakePoint(-79.87102, -6.76342), 4326), 60.00, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/huertos/pimentel_cover.jpg'),
    -- La Victoria (-6.79155, -79.84512)
    (id_huerto_la_victoria, id_user_prod_elena, 'Eco-Huerto Urbano La Victoria', 'Proyecto vecinal de agricultura urbana sostenible en patios reducidos.', 'Av. Los Incas 780, La Victoria', ST_SetSRID(ST_MakePoint(-79.84512, -6.79155), 4326), 30.00, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/huertos/victoria_cover.jpg');
  
    -- 4. POBLAR PARCELAS
    INSERT INTO parcela (id, biohuerto_id, nombre_identificador, area_metros_cuadrados, tipo_suelo) VALUES
    (id_parcela_brisas_1, id_huerto_las_brisas, 'Cama de Cultivo Principal #1', 20.00, 'Tierra directa enriquecida'),
    (id_parcela_brisas_2, id_huerto_las_brisas, 'Módulo Vertical de Hortalizas', 10.50, 'Maceta / Sustrato orgánico'),
    (id_parcela_pimentel_1, id_huerto_pimentel, 'Sistema NFT Hidropónico A', 40.00, 'Hidroponía'),
    (id_parcela_victoria_1, id_huerto_la_victoria, 'Cajones de Madera Orgánicos', 15.00, 'Sustrato orgánico');

    -- 5. POBLAR CATÁLOGO MAESTRO DE PLANTAS (Familias Botánicas Reales)
    INSERT INTO catalogo_planta_maestro (id, nombre_comun, nombre_cientifico, familia_botanica, tiempo_estimado_cosecha_dias, icono_url) VALUES
    (id_master_tomate, 'Tomate Cherry', 'Solanum lycopersicum var. cerasiforme', 'Solanáceas', 80, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/icons/tomate.png'),
    (id_master_lechuga, 'Lechuga Orgánica', 'Lactuca sativa', 'Compuestas', 60, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/icons/lechuga.png'),
    (id_master_albahaca, 'Albahaca Aromática', 'Ocimum basilicum', 'Lamiáceas', 45, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/icons/albahaca.png'),
    (id_master_espinaca, 'Espinaca de Hoja Ancha', 'Spinacia oleracea', 'Amarantáceas', 50, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/icons/espinaca.png'),
    (id_master_fresa, 'Fresa San Andreas', 'Fragaria x ananassa', 'Rosáceas', 90, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/icons/fresa.png');

    -- 6. ASOCIAR PLANTAS MAESTRAS AL CATÁLOGO PERSONALIZADO DE USUARIOS
    INSERT INTO catalogo_planta_usuario (id, usuario_id, planta_maestra_id, nombre_personalizado, familia_personalizada, tiempo_cosecha_personalizado_dias) VALUES
    (id_u_planta_tomate, id_user_prod_rodrigo, id_master_tomate, NULL, NULL, NULL),
    (id_u_planta_lechuga, id_user_prod_rodrigo, id_master_lechuga, NULL, NULL, NULL),
    (id_u_planta_albahaca, id_user_prod_juan, id_master_albahaca, NULL, NULL, NULL),
    (id_u_planta_fresa, id_user_prod_elena, id_master_fresa, NULL, NULL, NULL);

    -- 7. POBLAR CULTIVOS ACTIVOS
    INSERT INTO cultivo (id, parcela_id, planta_usuario_id, fecha_siembra, etapa_actual, cantidad_sembrada, metodo_siembra, fecha_estimada_cosecha) VALUES
    (id_cultivo_tomate, id_parcela_brisas_1, id_u_planta_tomate, CURRENT_DATE - INTERVAL '40 days', 'Crecimiento', '30 plántulas', 'Trasplante', CURRENT_DATE + INTERVAL '40 days'),
    (id_cultivo_lechuga, id_parcela_brisas_2, id_u_planta_lechuga, CURRENT_DATE - INTERVAL '58 days', 'Cosecha', '5 m2', 'Al voleo', CURRENT_DATE + INTERVAL '2 days'),
    (id_cultivo_albahaca, id_parcela_pimentel_1, id_u_planta_albahaca, CURRENT_DATE - INTERVAL '10 days', 'Siembra', '100 canales', 'Sustrato líquido', CURRENT_DATE + INTERVAL '35 days'),
    (id_cultivo_fresa, id_parcela_victoria_1, id_u_planta_fresa, CURRENT_DATE - INTERVAL '60 days', 'Crecimiento', '15 plantones', 'Cajón elevado', CURRENT_DATE + INTERVAL '30 days');

    -- 8. POBLAR HISTORIAL DE MONITOREO (¡Corregido de id_incidencias_relevantes a incidencias_relevantes!)
    INSERT INTO monitoreo_cultivo (cultivo_id, fecha_registro, humedad_suelo, temperatura_ambiente, luminosidad_porcentaje, observaciones, incidencias_relevantes) VALUES
    (id_cultivo_tomate, CURRENT_TIMESTAMP - INTERVAL '2 days', 65.20, 24.50, 80.00, 'Crecimiento foliar óptimo, se nota vigoroso', 'Ninguna'),
    (id_cultivo_tomate, CURRENT_TIMESTAMP, 42.10, 26.80, 95.00, 'Humedad en descenso por alta temperatura en Chiclayo. Requierre riego urgente.', 'Estrés hídrico leve'),
    (id_cultivo_lechuga, CURRENT_TIMESTAMP - INTERVAL '1 day', 70.00, 22.10, 60.00, 'Hojas listas y crujientes para el corte diario.', 'Ninguna');

    -- 9. POBLAR ALERTAS Y RECORDATORIOS
    INSERT INTO alerta_recordatorio (biohuerto_id, cultivo_id, tipo_alerta, titulo, descripcion, prioridad, fecha_programada, completada, fecha_completada) VALUES
    (id_huerto_las_brisas, id_cultivo_tomate, 'Riego', 'Riego Profundo - Parcela A', 'La humedad del suelo bajó del 45%. Aplicar riego por goteo.', 'ALTA', CURRENT_TIMESTAMP + INTERVAL '2 hours', FALSE, NULL),
    (id_huerto_las_brisas, id_cultivo_tomate, 'Fertilización', 'Aplicación de Humus de Lombriz', 'Toca abonado de refuerzo orgánico según el calendario.', 'MEDIA', CURRENT_TIMESTAMP + INTERVAL '1 day', FALSE, NULL),
    (id_huerto_las_brisas, id_cultivo_lechuga, 'Cosecha', 'Cosecha Final de Lote de Lechugas', 'Extraer las plantas antes de que se amarguen.', 'ALTA', CURRENT_TIMESTAMP, FALSE, NULL);

    -- 10. POBLAR DIAGNÓSTICOS FITOSANITARIOS
    INSERT INTO diagnostico_plaga (cultivo_id, fecha_analisis, imagen_url, resultado_diagnostico, nivel_confianza, tratamiento_sugerido) VALUES
    (id_cultivo_tomate, CURRENT_TIMESTAMP - INTERVAL '10 days', 'https://res.cloudinary.com/bioned-usat/image/upload/v1/diagnostics/tizon_tomate_01.jpg', 'Mosca Blanca (Bemisia tabaci)', 89.70, 'Aplicar pulverización con jabón potásico y aceite de neem cada 3 días en el envés de las hojas.');

    -- 11. POBLAR FINANZAS
    INSERT INTO registro_financiero (biohuerto_id, cultivo_id, tipo_transaccion, categoria, monto, descripcion, fecha_transaccion) VALUES
    (id_huerto_las_brisas, id_cultivo_tomate, 'EGRESO', 'Semillas', 25.00, 'Compra de semillas de Tomate Cherry.', CURRENT_DATE - INTERVAL '41 days'),
    (id_huerto_las_brisas, id_cultivo_tomate, 'EGRESO', 'Abono', 45.00, 'Saco de 20kg de Humus de lombriz.', CURRENT_DATE - INTERVAL '40 days'),
    (id_huerto_las_brisas, id_cultivo_lechuga, 'INGRESO', 'Venta Excedente', 120.00, 'Venta de la primera tanda de lechugas a vecinos.', CURRENT_DATE - INTERVAL '5 days');

    -- 12. POBLAR TRAZABILIDAD AGROECOLÓGICA
    INSERT INTO registro_practica_agricola (cultivo_id, tipo_practica, es_organico, descripcion, fecha_aplicacion) VALUES
    (id_cultivo_tomate, 'Aplicación de Compost', TRUE, 'Incorporación de compost elaborado a base de residuos orgánicos.', CURRENT_TIMESTAMP - INTERVAL '40 days'),
    (id_cultivo_tomate, 'Control Biológico', TRUE, 'Uso de trampas cromáticas amarillas para control de moscas.', CURRENT_TIMESTAMP - INTERVAL '9 days');

    -- 13. POBLAR MARKETPLACE
    INSERT INTO publicacion_cosecha (cultivo_id, titulo, descripcion, precio_por_kg, cantidad_disponible, imagen_url, activa) VALUES
    (id_cultivo_lechuga, 'Lechuga Orgánica Crujiente', 'Cosechadas hoy mismo en nuestro biohuerto familiar. Libres de pesticidas.', 3.50, 15.00, 'https://res.cloudinary.com/bioned-usat/image/upload/v1/marketplace/lechugas_frescas.jpg', TRUE);

END $$;