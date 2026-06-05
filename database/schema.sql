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

