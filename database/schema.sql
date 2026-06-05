-- Drop tables if they exist to start clean
DROP TABLE IF EXISTS monitorings CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;
DROP TABLE IF EXISTS zones CASCADE;

-- 1. Create sensors table
CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('temperature', 'pressure', 'vibration', 'flow')) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    manufacture_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create zones table
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100) NOT NULL,
    operational_status VARCHAR(20) CHECK (operational_status IN ('operational', 'non-operational')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Create monitorings table
CREATE TABLE monitorings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    zone_id INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    installation_date DATE NOT NULL,
    reading_type VARCHAR(20) CHECK (reading_type IN ('temperature', 'pressure', 'vibration', 'flow')) NOT NULL,
    threshold_value NUMERIC(10,2) CHECK (threshold_value > 0) NOT NULL,
    current_value NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'paused')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (sensor_id, zone_id, reading_type)
);

-- 4. Seed sensors data (at least 10 rows)
INSERT INTO sensors (name, type, manufacturer, manufacture_date) VALUES
('Sensor Temperatura A1', 'temperature', 'Siemens', '2024-01-15'),
('Sensor Presión B1', 'pressure', 'Emerson', '2024-02-10'),
('Sensor Vibración C1', 'vibration', 'Honeywell', '2023-11-05'),
('Sensor Flujo D1', 'flow', 'ABB', '2024-03-22'),
('Sensor Temperatura A2', 'temperature', 'Siemens', '2024-02-18'),
('Sensor Presión B2', 'pressure', 'Emerson', '2024-04-01'),
('Sensor Vibración C2', 'vibration', 'Honeywell', '2024-01-20'),
('Sensor Flujo D2', 'flow', 'ABB', '2023-12-15'),
('Sensor Temperatura A3', 'temperature', 'Bosch', '2024-05-10'),
('Sensor Presión B3', 'pressure', 'Bosch', '2024-05-15');

-- 5. Seed zones data (at least 10 rows)
INSERT INTO zones (name, description, location, operational_status) VALUES
('Zona de Calderas', 'Área donde están ubicadas las calderas principales de vapor.', 'Planta 1 - Sector A', 'operational'),
('Cuarto de Compresores', 'Área de compresores de alta presión para aire comprimido.', 'Planta 1 - Sector B', 'operational'),
('Línea de Envasado', 'Línea de envasado automatizada para producto terminado.', 'Planta 2 - Sector C', 'operational'),
('Generador Eléctrico', 'Área de generación de energía eléctrica de emergencia.', 'Planta 1 - Sector D', 'operational'),
('Tanque de Almacenamiento A', 'Tanque principal de agua de proceso.', 'Planta Exterior - Sector E', 'operational'),
('Tanque de Almacenamiento B', 'Tanque secundario para almacenamiento de combustible.', 'Planta Exterior - Sector F', 'non-operational'),
('Taller de Mantenimiento', 'Taller general de reparaciones mecánicas y eléctricas.', 'Planta 3 - Sector G', 'operational'),
('Laboratorio de Control', 'Área de control de calidad y calibración de instrumentación.', 'Planta 2 - Sector H', 'operational'),
('Zona de Enfriamiento', 'Torres de enfriamiento para circuito de agua industrial.', 'Planta Exterior - Sector I', 'operational'),
('Bodega de Reactivos', 'Almacén seguro para productos químicos y reactivos.', 'Planta 1 - Sector J', 'operational');

-- 6. Seed monitorings data (at least 10 rows)
-- Note: Some current_value are set higher than threshold_value to trigger visual warnings in frontend
INSERT INTO monitorings (sensor_id, zone_id, installation_date, reading_type, threshold_value, current_value, status) VALUES
(1, 1, '2026-06-01', 'temperature', 80.00, 95.50, 'active'),        -- Warning: 95.50 > 80.00
(2, 2, '2026-06-01', 'pressure', 150.00, 120.00, 'active'),
(3, 3, '2026-06-02', 'vibration', 5.00, 4.20, 'active'),
(4, 3, '2026-06-02', 'flow', 200.00, 215.00, 'active'),             -- Warning: 215.00 > 200.00
(5, 1, '2026-06-03', 'temperature', 100.00, 85.00, 'paused'),
(6, 4, '2026-06-03', 'pressure', 300.00, 310.00, 'active'),         -- Warning: 310.00 > 300.00
(7, 2, '2026-06-04', 'vibration', 10.00, 8.50, 'active'),
(8, 5, '2026-06-04', 'flow', 50.00, 48.00, 'active'),
(9, 9, '2026-06-05', 'temperature', 40.00, 42.50, 'active'),        -- Warning: 42.50 > 40.00
(10, 10, '2026-06-05', 'pressure', 50.00, 20.00, 'paused');
