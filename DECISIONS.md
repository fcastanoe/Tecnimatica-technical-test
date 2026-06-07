# Decisiones Técnicas del Proyecto

Este documento describe las principales decisiones técnicas tomadas durante el diseño y desarrollo del sistema de monitoreo industrial.

La solución fue construida priorizando tres criterios: correcta representación del modelo de datos, cumplimiento de los endpoints solicitados y una experiencia de usuario clara para visualizar zonas, sensores, estados y alertas por umbral.

---

## 1. ¿Cómo modelaste la relación entre sensores y zonas y por qué?

La relación entre **sensores** y **zonas** se modeló como una relación de **muchos a muchos (M:N)** mediante una tabla intermedia llamada `monitorings`.

Esta decisión se tomó porque el contexto del problema indica que:

* Un sensor puede monitorear varias zonas.
* Una zona puede tener varios sensores activos al mismo tiempo.
* La relación entre un sensor y una zona tiene información propia.

Por esta razón, no era adecuado guardar `zone_id` directamente en la tabla `sensors`, porque eso limitaría a cada sensor a una sola zona. Tampoco era correcto guardar `sensor_id` directamente en la tabla `zones`, porque eso limitaría a cada zona a un solo sensor.

La tabla `monitorings` permite representar correctamente la asignación entre sensores y zonas y almacenar los datos propios de dicha asignación:

* `installation_date`: fecha de instalación del sensor en la zona.
* `reading_type`: tipo de lectura realizada en esa zona.
* `threshold_value`: valor umbral configurado para alertas.
* `current_value`: lectura actual utilizada para comparar contra el umbral.
* `status`: estado del monitoreo, activo o pausado.

Esta estructura mantiene el modelo normalizado, evita duplicidad innecesaria de datos y permite consultar de forma clara qué sensores están asociados a cada zona y qué zonas son monitoreadas por cada sensor.

Además, se incluyó `current_value` en la tabla `monitorings` para poder resolver el requisito visual del frontend: mostrar cuando el valor de un sensor supera el umbral configurado. En una versión productiva, este valor podría separarse en una tabla histórica de lecturas, pero para el alcance de esta prueba se mantuvo en `monitorings` para conservar una solución simple y funcional.

---

## 2. ¿Qué validación o restricción consideras más importante en tu solución y por qué?

La validación más importante es la combinación de integridad relacional, restricción única y coherencia de negocio en las asignaciones de monitoreo.

A nivel de base de datos, se utilizó la siguiente restricción:

```sql
UNIQUE (sensor_id, zone_id, reading_type)
```

Esta restricción evita que se creen asignaciones duplicadas del mismo sensor, en la misma zona, con el mismo tipo de lectura. Su importancia está en que previene configuraciones redundantes o contradictorias dentro del sistema de monitoreo.

Por ejemplo, sin esta restricción podrían existir dos registros activos para el mismo sensor de temperatura en la misma zona, pero con umbrales distintos. Eso podría generar ambigüedad al momento de interpretar alertas.

Además de la restricción única, se implementaron otras validaciones relevantes:

* `threshold_value` debe ser mayor que cero.
* `status` solo puede tener valores permitidos, como `active` o `paused`.
* `reading_type` solo puede corresponder a tipos válidos: `temperature`, `pressure`, `vibration` o `flow`.
* El sensor debe existir antes de crear un monitoreo.
* La zona debe existir antes de crear un monitoreo.
* El tipo de lectura debe ser coherente con el tipo del sensor seleccionado.

La validación de coherencia entre el tipo del sensor y el tipo de lectura es especialmente importante desde el punto de vista del negocio. Por ejemplo, no tendría sentido que un sensor de temperatura sea asignado para medir flujo o vibración. Por eso, en el formulario del frontend el tipo de lectura se autocompleta a partir del sensor seleccionado y se restringe para evitar inconsistencias físicas.

Estas validaciones se aplican tanto desde la lógica de la aplicación como desde la base de datos, buscando proteger la integridad de la información incluso si en el futuro se agregan nuevos clientes o interfaces.

---

## 3. ¿Cómo organizaste la estructura de tu backend y por qué elegiste esa organización?

El backend se organizó bajo una arquitectura de **capas separadas de responsabilidad**, utilizando Node.js, Express, TypeScript y PostgreSQL.

La estructura general se dividió así:

* `config/`: configuración de conexión a la base de datos PostgreSQL.
* `routes/`: definición de rutas de la API REST.
* `controllers/`: recepción de peticiones HTTP, extracción de parámetros y envío de respuestas.
* `services/`: lógica de negocio y consultas SQL hacia la base de datos.
* `interfaces/` o `types/`: definición de tipos e interfaces TypeScript.
* `middlewares/`: manejo centralizado de errores y lógica común del servidor.

Esta organización se eligió porque permite separar claramente las responsabilidades del backend.

Las rutas solo definen qué endpoint se expone. Los controladores manejan la comunicación HTTP. Los servicios concentran la lógica de negocio y el acceso a datos. Las interfaces ayudan a mantener consistencia en las estructuras utilizadas por la aplicación. Los middlewares permiten responder errores de manera uniforme y evitar respuestas genéricas.

Esta separación facilita:

* La lectura del código.
* El mantenimiento futuro.
* La corrección de errores.
* La reutilización de lógica.
* La posibilidad de agregar pruebas en el futuro.
* El cumplimiento del requisito de tener tipos e interfaces definidos en archivos separados.

También se utilizaron consultas SQL parametrizadas para evitar concatenar valores directamente dentro de las consultas. Esto reduce riesgos de inyección SQL y permite interactuar con PostgreSQL de forma más segura.

La arquitectura se mantuvo intencionalmente simple. No se incorporó un ORM ni una estructura más compleja porque el objetivo principal de la prueba era demostrar dominio del modelo relacional, SQL, API REST y comunicación con el frontend.

---

## 4. Si tuvieras un día adicional para mejorar el proyecto, ¿qué funcionalidad o mejora técnica implementarías primero y por qué?

Si contara con un día adicional, la primera mejora técnica y funcional que implementaría sería un **historial dinámico de lecturas de sensores**.

Actualmente, el campo `current_value` permite representar el estado actual de una lectura y comparar ese valor con el umbral configurado. Esto es suficiente para cumplir el alcance de la prueba y mostrar alertas visuales en el frontend.

Sin embargo, en un entorno industrial real, una sola lectura actual no es suficiente. Es necesario analizar el comportamiento de los sensores a lo largo del tiempo para identificar tendencias, patrones anormales o señales tempranas de falla.

Por eso, agregaría una tabla llamada `sensor_readings` con una estructura similar a:

```sql
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    monitoring_id INTEGER NOT NULL REFERENCES monitorings(id) ON DELETE CASCADE,
    value NUMERIC(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Esta tabla permitiría guardar múltiples lecturas asociadas a un monitoreo específico.

Con esta mejora se podrían implementar funcionalidades como:

* Historial de temperatura, presión, vibración o flujo.
* Gráficas de comportamiento por sensor.
* Comparación de lecturas contra el umbral en el tiempo.
* Identificación de tendencias de riesgo.
* Base inicial para mantenimiento predictivo.

En el frontend, esta mejora podría visualizarse mediante una gráfica en la vista de detalle de zona, mostrando la evolución de cada sensor respecto a su umbral.

No se implementó en esta versión para mantener el alcance controlado y priorizar los requerimientos principales de la prueba: modelado relacional, endpoints solicitados, asignación de sensores a zonas, actualización de monitoreos, visualización de estados y alerta por umbral superado.

---

## Consideración adicional

Como mejora técnica complementaria, el proyecto también podría contenerizarse con Docker y Docker Compose. Esto permitiría levantar PostgreSQL, backend y frontend desde un solo comando, facilitando la ejecución del sistema en otros entornos.

No se incluyó Docker en esta versión porque no era un requisito explícito de la prueba y se priorizó entregar una solución sencilla, funcional, documentada y fácil de ejecutar localmente.
