# Sistema de Monitoreo Industrial 🏭

Proyecto desarrollado como parte de la prueba técnica para **Tecnimática S.A.S.**

La solución consiste en una aplicación web fullstack para gestionar la asignación de sensores industriales a zonas específicas dentro de una planta. El sistema permite visualizar zonas de monitoreo, consultar sensores asociados, controlar umbrales de alerta, activar o pausar monitoreos y mostrar alertas visuales cuando una lectura supera el valor configurado.

---

## Objetivo del Proyecto

El sistema busca resolver el siguiente escenario:

Una planta industrial necesita rastrear qué sensores están asignados a qué zonas de monitoreo. Un sensor puede monitorear varias zonas, y una zona puede tener varios sensores activos al mismo tiempo. Además, cada asignación entre sensor y zona posee información propia, como fecha de instalación, tipo de lectura, valor umbral y estado del monitoreo.

La aplicación permite:

* Consultar las zonas de monitoreo industrial.
* Ver cuántos sensores tiene asignados cada zona.
* Consultar el detalle de una zona y sus sensores asignados.
* Asignar sensores a zonas.
* Configurar umbrales de alerta.
* Visualizar si un monitoreo está activo o pausado.
* Detectar visualmente cuando una lectura supera el umbral configurado.
* Activar o pausar monitoreos.
* Cambiar el estado operacional de una zona.

---

## Tecnologías Utilizadas

* **Base de Datos:** PostgreSQL
* **Backend:** Node.js, Express, TypeScript, PG PostgreSQL Client
* **Frontend:** React, Vite, TypeScript, Vanilla CSS
* **Control de Versiones:** Git y GitHub

---

## Estructura del Proyecto

```txt
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   └── schema.sql
│
├── DECISIONS.md
└── README.md
```

---

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

* **Node.js** versión 18.0.0 o superior.
* **PostgreSQL** corriendo localmente.
* Un gestor de base de datos como **pgAdmin**, **DBeaver** o el cliente de consola `psql`.
* Git, en caso de clonar el repositorio desde GitHub.

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/fcastanoe/Tecnimatica-technical-test.git
cd Tecnimatica-technical-test
```

---

### 2. Configurar la base de datos

Abre PostgreSQL desde pgAdmin, DBeaver o consola y crea una base de datos vacía llamada:

```sql
CREATE DATABASE tecnimatica_monitoring;
```

Luego ejecuta el archivo:

```txt
database/schema.sql
```

Este archivo crea las tablas principales del sistema:

* `sensors`
* `zones`
* `monitorings`

También inserta datos de prueba suficientes para validar el funcionamiento del backend y del frontend.

---

### 3. Configurar e iniciar el backend

Entra a la carpeta del backend:

```bash
cd backend
```

Instala las dependencias:

```bash
npm install
```

Crea un archivo `.env` en la raíz de la carpeta `backend`, tomando como base el archivo `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgresql
DB_NAME=tecnimatica_monitoring
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Si todo está configurado correctamente, deberías ver en consola mensajes similares a:

```txt
Server running on port 3000
Database connected successfully
```

El backend quedará disponible en:

```txt
http://localhost:3000
```

---

### 4. Configurar e iniciar el frontend

Abre una nueva terminal y entra a la carpeta del frontend:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo de Vite:

```bash
npm run dev
```

Abre en el navegador la dirección indicada por la consola. Normalmente será:

```txt
http://localhost:5173/
```

---

## Endpoints del Backend

| Método    | Ruta                 | Descripción                                                                                  |
| :-------- | :------------------- | :------------------------------------------------------------------------------------------- |
| **GET**   | `/sensors`           | Obtiene la lista completa de sensores disponibles.                                           |
| **GET**   | `/sensors/:id/zones` | Retorna las zonas monitoreadas por un sensor específico.                                     |
| **GET**   | `/zones`             | Obtiene la lista completa de zonas con su estado operacional. |
| **GET**   | `/zones/:id/sensors` | Lista los sensores asignados a una zona.                                                     |
| **PATCH** | `/zones/:id`         | Cambia el estado operacional de una zona.                                                    |
| **POST**  | `/monitorings`       | Crea una nueva asignación de sensor a zona.                                                  |
| **PATCH** | `/monitorings/:id`   | Modifica el valor umbral o estado de una asignación.                           |
| **GET**   | `/monitorings`       | Retorna todos los monitoreos. Permite filtro opcional por estado.                            |

Ejemplo de filtro por estado:

```txt
GET /monitorings?status=active
GET /monitorings?status=paused
```

---

## Funcionalidades Principales

### Listado de zonas

La aplicación muestra las zonas de monitoreo de la planta, incluyendo:

* Nombre de la zona.
* Ubicación dentro de la planta.
* Estado operacional.
* Cantidad de sensores asignados.

---

### Detalle de zona

Al seleccionar una zona, se muestra:

* Descripción de la zona.
* Ubicación.
* Estado operacional.
* Sensores asignados.
* Tipo de lectura.
* Valor actual.
* Valor umbral.
* Estado del monitoreo.
* Indicador visual de alerta.

---

### Asignación de sensores

El formulario permite crear una nueva asignación entre un sensor y una zona.

Campos principales:

* Sensor.
* Zona.
* Tipo de lectura.
* Fecha de instalación.
* Valor umbral.
* Valor actual.
* Estado del monitoreo.

El tipo de lectura se autocompleta según el tipo del sensor seleccionado, evitando inconsistencias físicas como asignar un sensor de temperatura a una lectura de flujo o vibración.

---

### Alertas por umbral

El sistema compara el valor actual con el umbral configurado:

```txt
current_value > threshold_value
```

Cuando el valor actual supera el umbral, la interfaz muestra una alerta visual para indicar que existe una condición que requiere atención.

---

### Control de estado de monitoreos

Desde el detalle de una zona es posible activar o pausar un monitoreo.

Esto permite diferenciar entre:

* Un sensor asignado y actualmente monitoreando.
* Un sensor asignado pero con monitoreo pausado.

---

### Control de estado de zonas

El sistema permite cambiar el estado operacional de una zona.

Cuando una zona no está operacional, la interfaz muestra una advertencia visual y restringe la creación de monitoreos activos, priorizando la coherencia del estado de la planta.

---

### Unidades físicas

Los valores de lectura y umbral se muestran con unidades acordes al tipo de sensor:

| Tipo de lectura | Unidad |
| :-------------- | :----- |
| `temperature`   | °C     |
| `pressure`      | bar    |
| `vibration`     | mm/s   |
| `flow`          | L/min  |

---

## Validaciones Implementadas

La API valida:

* Existencia del sensor antes de crear una asignación.
* Existencia de la zona antes de crear una asignación.
* Valor umbral mayor que cero.
* Estados permitidos para monitoreos.
* Tipos de lectura permitidos.
* Prevención de asignaciones duplicadas para la misma combinación de sensor, zona y tipo de lectura.

Por su parte, el frontend valida y controla:

* Coherencia entre el tipo del sensor y el tipo de lectura asignado (autocompletando y bloqueando el campo según el sensor seleccionado).

Además, la base de datos incluye restricciones para reforzar la integridad de los datos desde PostgreSQL.

---

## Cumplimiento de Requisitos de la Prueba

| Requisito                                                | Estado   |
| :------------------------------------------------------- | :------- |
| Diseño de esquema SQL para sensores, zonas y monitoreos  | Cumplido |
| Relación muchos a muchos entre sensores y zonas          | Cumplido |
| Tabla intermedia con información propia de la asignación | Cumplido |
| Archivo `schema.sql` con esquema completo                | Cumplido |
| Datos de prueba en la base de datos                      | Cumplido |
| `GET /sensors`                                           | Cumplido |
| `GET /sensors/:id/zones`                                 | Cumplido |
| `GET /zones/:id/sensors`                                 | Cumplido |
| `POST /monitorings`                                      | Cumplido |
| `PATCH /monitorings/:id`                                 | Cumplido |
| `GET /monitorings` con filtro opcional por estado        | Cumplido |
| Tipos e interfaces separados en el backend               | Cumplido |
| Manejo de errores HTTP 400, 404 y 500                    | Cumplido |
| Mensajes de error descriptivos                           | Cumplido |
| Frontend con listado de zonas                            | Cumplido |
| Frontend con detalle de zona                             | Cumplido |
| Formulario para asignar sensores a zonas                 | Cumplido |
| Indicador visual activo/pausado                          | Cumplido |
| Alerta visual por umbral superado                        | Cumplido |
| Repositorio con commits progresivos                      | Cumplido |
| Archivo `DECISIONS.md`                                   | Cumplido |

---

## Notas Técnicas

* El backend utiliza consultas SQL parametrizadas para reducir el riesgo de inyección SQL.
* La base de datos aplica restricciones `CHECK`, llaves foráneas y una restricción única compuesta.
* El frontend consume la API REST y refleja los cambios realizados sobre los monitoreos.
* Se priorizó una solución funcional, clara y fácil de ejecutar localmente.
* No se incluyó Docker en esta versión porque no era un requisito explícito de la prueba. Como mejora futura, el proyecto podría contenerizarse con Docker Compose para levantar base de datos, backend y frontend desde un solo comando.

---

## Uso de Herramientas Asistidas por IA

Durante el desarrollo del proyecto se utilizaron herramientas asistidas por inteligencia artificial como apoyo complementario en el flujo de trabajo, principalmente mediante Antigravity y modelos como Claude y Gemini.

Estas herramientas se emplearon para tareas de apoyo como:

- Revisión de estructura del proyecto.
- Validación de posibles errores en el código.
- Verificación de consultas y decisiones relacionadas con SQL.
- Revisión de redacción técnica en la documentación.
- Organización de ideas para el README.md y DECISIONS.md.
- Apoyo en pruebas manuales y revisión de coherencia entre frontend, backend y base de datos.

El uso de estas herramientas no reemplazó el proceso de análisis, implementación, prueba y toma de decisiones del desarrollador. La solución final fue revisada, ajustada y validada manualmente, asegurando comprensión del modelo de datos, endpoints, reglas de negocio y funcionamiento general de la aplicación.

---

## Posibles Mejoras Futuras

- Agregar una tabla histórica de lecturas de sensores (`sensor_readings`) para almacenar valores en el tiempo.
- Incorporar gráficas de comportamiento por sensor y zona, comparando lecturas históricas contra sus umbrales.
- Explorar análisis de series temporales y detección de anomalías como base para mantenimiento predictivo.
- Implementar filtros avanzados por zona, tipo de sensor, estado de monitoreo o condición de alerta.
- Agregar Docker Compose para facilitar la ejecución del entorno completo.
- Incorporar pruebas automatizadas para servicios y endpoints principales.

---

## Autor

Desarrollado por **Fredy Andrés Castaño** como parte de la prueba técnica para Tecnimática S.A.S.

