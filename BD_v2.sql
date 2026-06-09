-- =========================================================================
-- SCRIPT DEFINITIVO: ECOSISTEMA DIGITAL PARA BIOHUERTOS (USAT 2026)
-- MOTOR: PostgreSQL (Neon) con PostGIS + Soporte Cloudinary
-- ARQUITECTURA: Escalable (Biohuerto -> Parcela -> Cultivo)
-- =========================================================================

-- =========================================================================
-- EXTENSIONES REQUERIDAS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis; -- Soporte para ubicación geoespacial (Módulo 2)

-- =========================================================================
-- 1. MÓDULO DE USUARIOS Y ROLES (Con Soporte Cloudinary)
-- =========================================================================
CREATE TABLE rol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL, -- 'PRODUCTOR', 'COMPRADOR', 'ADMIN'
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id UUID NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20), -- Clave para redirección de pedidos por WhatsApp
    password_hash TEXT NOT NULL,
    foto_perfil_url TEXT, -- URL segura de Cloudinary para el avatar del usuario
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
);

-- =========================================================================
-- 2. MÓDULO DE BIOHUERTOS (El Macro-espacio)
-- =========================================================================
CREATE TABLE biohuerto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dueno_id UUID NOT NULL,
    nombre_huerto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion_texto TEXT NOT NULL, -- Ej: 'Av. Pimentel 123, Chiclayo'
    ubicacion_geo GEOMETRY(Point, 4326) NOT NULL, -- Coordenadas GPS (Lat, Long) para PostGIS
    area_metros_cuadrados NUMERIC(8,2) DEFAULT 0.00 NOT NULL, -- Área total de la propiedad
    foto_portada_url TEXT, -- URL segura de Cloudinary para las tarjetas estilo Gromuse
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_biohuerto_dueno FOREIGN KEY (dueno_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- =========================================================================
-- 2.1. MÓDULO DE PARCELAS (El Micro-espacio físico - Nivel Pro)
-- =========================================================================
CREATE TABLE parcela (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biohuerto_id UUID NOT NULL,
    nombre_identificador VARCHAR(100) NOT NULL, -- Ej: 'Invernadero 1', 'Patio Trasero'
    area_metros_cuadrados NUMERIC(8,2) NOT NULL, -- Cuánto mide este sector específico
    tipo_suelo VARCHAR(50), -- Ej: 'Tierra directa', 'Maceta', 'Hidroponía'
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_parcela_biohuerto FOREIGN KEY (biohuerto_id) REFERENCES biohuerto(id) ON DELETE CASCADE
);

-- =========================================================================
-- 3. MÓDULO DE CATÁLOGOS Y PLANTAS
-- =========================================================================
CREATE TABLE catalogo_planta_maestro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_comun VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'Tomate Cherry', 'Lechuga Hidropónica'
    nombre_cientifico VARCHAR(150),
    familia_botanica VARCHAR(100) NOT NULL,    -- Solanáceas, Cucurbitáceas, etc.
    tiempo_estimado_cosecha_dias INT NOT NULL,
    icono_url TEXT -- URL de Cloudinary para los íconos de la planta
);

CREATE TABLE catalogo_planta_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    planta_maestra_id UUID, -- NULL si el productor registra una planta desde cero
    
    -- Campos si es una planta 100% personalizada por el productor
    nombre_personalizado VARCHAR(100),
    familia_personalizada VARCHAR(100),
    tiempo_cosecha_personalizado_dias INT,
    
    fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_catalogo FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_planta_maestra FOREIGN KEY (planta_maestra_id) REFERENCES catalogo_planta_maestro(id) ON DELETE SET NULL,
    CONSTRAINT chk_planta_definica CHECK (planta_maestra_id IS NOT NULL OR nombre_personalizado IS NOT NULL)
);

-- =========================================================================
-- 4. MÓDULO DE GESTIÓN DE CULTIVOS Y MONITOREO
-- =========================================================================
CREATE TABLE cultivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcela_id UUID NOT NULL, -- Apunta a la parcela específica, no al biohuerto general
    planta_usuario_id UUID NOT NULL, 
    fecha_siembra DATE NOT NULL,
    etapa_actual VARCHAR(50) NOT NULL DEFAULT 'Siembra', -- 'Siembra', 'Crecimiento', 'Cosecha', 'Finalizado'
    cantidad_sembrada VARCHAR(100) NOT NULL,    -- Ej: '50 plántulas', '3 m2'
    metodo_siembra VARCHAR(50) DEFAULT 'Al voleo', -- Valor Agregado agroecológico
    fecha_estimada_cosecha DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cultivo_parcela FOREIGN KEY (parcela_id) REFERENCES parcela(id) ON DELETE CASCADE,
    CONSTRAINT fk_cultivo_planta FOREIGN KEY (planta_usuario_id) REFERENCES catalogo_planta_usuario(id)
);

CREATE TABLE monitoreo_cultivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    humedad_suelo NUMERIC(5,2), -- Porcentaje %
    temperatura_ambiente NUMERIC(5,2), -- Grados °C
    luminosidad_porcentaje NUMERIC(5,2), -- Numérico para precisión/sensores futuros
    incidencias_relevantes TEXT, 
    observaciones TEXT,
    
    CONSTRAINT fk_monitoreo_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);

CREATE TABLE alerta_recordatorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biohuerto_id UUID NOT NULL, -- Permite recordatorios generales de toda la propiedad
    cultivo_id UUID,       -- Opcional, por si es específica de un cultivo en una parcela
    tipo_alerta VARCHAR(50) NOT NULL DEFAULT 'Riego', -- 'Riego', 'Fertilización', 'Prevención', 'Cosecha', 'Rotación'
    titulo VARCHAR(100) NOT NULL, 
    descripcion TEXT,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA', -- 'ALTA', 'MEDIA', 'BAJA'
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_completada TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_alerta_biohuerto FOREIGN KEY (biohuerto_id) REFERENCES biohuerto(id) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE SET NULL
);

-- =========================================================================
-- 5. MÓDULO DE DIAGNÓSTICO FITOSANITARIO (IA / SALUD)
-- =========================================================================
CREATE TABLE diagnostico_plaga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL,
    fecha_analisis TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    imagen_url TEXT NOT NULL, 
    resultado_diagnostico VARCHAR(150) NOT NULL, -- Ej: 'Tizón Tardío detectado'
    nivel_confianza NUMERIC(5,2) NOT NULL,       -- Ej: 94.50%
    tratamiento_sugerido TEXT NOT NULL,
    
    CONSTRAINT fk_diagnostico_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);

-- =========================================================================
-- 6. MÓDULO DE FINANZAS (COSTOS E INGRESOS)
-- =========================================================================
CREATE TABLE registro_financiero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biohuerto_id UUID NOT NULL,
    cultivo_id UUID, -- Opcional, para rastrear rentabilidad por cultivo específico
    tipo_transaccion VARCHAR(20) NOT NULL, -- 'EGRESO' o 'INGRESO'
    categoria VARCHAR(50) NOT NULL,        -- Ej: 'Semillas', 'Abono', 'Venta Excedente'
    monto NUMERIC(10,2) NOT NULL,          -- En Soles (S/.)
    descripcion TEXT,
    fecha_transaccion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    CONSTRAINT fk_finanzas_biohuerto FOREIGN KEY (biohuerto_id) REFERENCES biohuerto(id) ON DELETE CASCADE,
    CONSTRAINT fk_finanzas_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE SET NULL,
    CONSTRAINT chk_tipo_transaccion CHECK (tipo_transaccion IN ('INGRESO', 'EGRESO'))
);

-- =========================================================================
-- 7. MÓDULO DE TRAZABILIDAD AGROECOLÓGICA
-- =========================================================================
CREATE TABLE registro_practica_agricola (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL,
    tipo_practica VARCHAR(50) NOT NULL, -- Ej: 'Aplicación de Compost', 'Riego Eficiente'
    es_organico BOOLEAN NOT NULL DEFAULT TRUE, 
    descripcion TEXT,
    fecha_aplicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_practica_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);

-- =========================================================================
-- 8. MÓDULO DE MARKETPLACE (VISTA PÚBLICA DEL COMPRADOR)
-- =========================================================================
CREATE TABLE publicacion_cosecha (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL, 
    titulo VARCHAR(150) NOT NULL, -- Ej: 'Tomate Cherry Premium Orgánico'
    descripcion TEXT,
    precio_por_kg NUMERIC(10,2) NOT NULL, -- En Soles (S/.)
    cantidad_disponible NUMERIC(10,2) NOT NULL, -- Ej: 12.50 kg
    imagen_url TEXT, 
    activa BOOLEAN NOT NULL DEFAULT TRUE, 
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_publicacion_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);