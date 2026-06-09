-- =========================================================================
-- EXTENSIONES REQUERIDAS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis; -- Soporte para ubicación geoespacial

-- =========================================================================
-- 1. MODULO DE USUARIOS Y ROLES
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
    telefono VARCHAR(20),
    password_hash TEXT NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
);

-- =========================================================================
-- 2. MÓDULO DE BIOHUERTOS
-- =========================================================================
CREATE TABLE biohuerto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dueno_id UUID NOT NULL,
    nombre_huerto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion_texto TEXT NOT NULL, -- Ej: 'Av. Pimentel 123, Chiclayo'
    ubicacion_geo GEOMETRY(Point, 4326) NOT NULL, -- Coordenadas GPS (Lat, Long)
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_biohuerto_dueno FOREIGN KEY (dueno_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- =========================================================================
-- 3. MÓDULO DE CATÁLOGOS Y PLANTAS
-- =========================================================================
CREATE TABLE catalogo_planta_maestro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_comun VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'Tomate', 'Lechuga'
    nombre_cientifico VARCHAR(150),
    familia_botanica VARCHAR(100) NOT NULL,    -- Solanáceas, Cucurbitáceas, etc.
    tiempo_estimado_cosecha_dias INT NOT NULL,
    icono_url TEXT
);

CREATE TABLE catalogo_planta_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    planta_maestra_id UUID, -- NULL si el usuario crea una planta desde cero
    
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
-- 4. MÓDULO DE GESTIÓN DE CULTIVOS (PRODUCCIÓN)
-- =========================================================================
CREATE TABLE cultivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biohuerto_id UUID NOT NULL,
    planta_usuario_id UUID NOT NULL, -- Apunta al catálogo personalizado del productor
    fecha_siembra DATE NOT NULL,
    etapa_actual VARCHAR(50) NOT NULL DEFAULT 'Siembra', -- 'Siembra', 'Crecimiento', 'Cosecha', 'Finalizado'
    identificador_parcela VARCHAR(100) NOT NULL, -- Solución simple a parcelas: 'Cama #1', 'Macetero A'
    cantidad_sembrada VARCHAR(100) NOT NULL,    -- Ej: '50 plántulas', '3 m2'
    fecha_estimada_cosecha DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cultivo_biohuerto FOREIGN KEY (biohuerto_id) REFERENCES biohuerto(id) ON DELETE CASCADE,
    CONSTRAINT fk_cultivo_planta FOREIGN KEY (planta_usuario_id) REFERENCES catalogo_planta_usuario(id)
);

CREATE TABLE monitoreo_cultivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    humedad_suelo NUMERIC(5,2), -- Porcentaje %
    temperatura_ambiente NUMERIC(5,2), -- Grados °C
    observaciones TEXT,
    
    CONSTRAINT fk_monitoreo_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);

CREATE TABLE tarea_riego (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL,
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_completada TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_tarea_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
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
-- 6. MÓDULO DE FINANZAS (COSTOS Y INGRESOS)
-- =========================================================================
CREATE TABLE registro_financiero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biohuerto_id UUID NOT NULL,
    cultivo_id UUID, -- Opcional, por si el gasto/ingreso es general del huerto o de una planta específica
    tipo_transaccion VARCHAR(20) NOT NULL, -- 'EGRESO' (Gasto) o 'INGRESO' (Venta)
    categoria VARCHAR(50) NOT NULL,        -- Ej: 'Semillas', 'Abono', 'Agua', 'Venta Excedente'
    monto NUMERIC(10,2) NOT NULL,          -- En soles (S/.)
    descripcion TEXT,
    fecha_transaccion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    CONSTRAINT fk_finanzas_biohuerto FOREIGN KEY (biohuerto_id) REFERENCES biohuerto(id) ON DELETE CASCADE,
    CONSTRAINT fk_finanzas_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE SET NULL,
    CONSTRAINT chk_tipo_transaccion CHECK (tipo_transaccion IN ('INGRESO', 'EGRESO'))
);

-- =========================================================================
-- 7. MÓDULO DE MARKETPLACE (PUBLICACIONES Y OFERTAS VISIBLES)
-- =========================================================================
CREATE TABLE publicacion_cosecha (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivo_id UUID NOT NULL, -- De qué cultivo proviene el excedente
    titulo VARCHAR(150) NOT NULL, -- Ej: 'Tomate Cherry Premium Orgánico'
    descripcion TEXT,
    precio_por_kg NUMERIC(10,2) NOT NULL,
    cantidad_disponible NUMERIC(10,2) NOT NULL, -- Ej: 12.50 kg
    imagen_url TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE, -- Para pausar/activar la oferta
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_publicacion_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);