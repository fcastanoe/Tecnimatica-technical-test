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

Adicionalmente, desde el frontend se controla la coherencia entre el tipo del sensor y el tipo de lectura, autocompletando y bloqueando el campo reading_type con base en el sensor seleccionado. Esto evita que desde la interfaz se creen combinaciones físicamente inconsistentes, como asignar un sensor de temperatura a una lectura de flujo o vibración.

Estas validaciones buscan proteger la integridad de la información y mantener una experiencia de usuario coherente con el contexto industrial del sistema.

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

Si contara con un día adicional, la primera mejora técnica que implementaría sería una base inicial para **monitoreo predictivo mediante análisis de series temporales y modelos de aprendizaje automático**, orientada a detectar comportamientos anómalos en las lecturas de los sensores.

Actualmente, el campo `current_value` permite representar el estado actual de una lectura y compararlo contra el umbral configurado. Esta solución es suficiente para cumplir el alcance de la prueba, porque permite mostrar alertas visuales cuando una lectura supera el valor permitido. Sin embargo, en un entorno industrial real, una lectura aislada no siempre es suficiente para anticipar riesgos. Muchos problemas no aparecen únicamente cuando se supera un umbral, sino cuando existe una tendencia anormal en el tiempo, por ejemplo, una vibración que aumenta progresivamente, una presión que oscila de forma irregular o una temperatura que se eleva lentamente antes de una falla.

Por esa razón, como primer paso agregaría una tabla histórica llamada `sensor_readings`, con una estructura similar a:

```sql
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    monitoring_id INTEGER NOT NULL REFERENCES monitorings(id) ON DELETE CASCADE,
    value NUMERIC(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Esta tabla permitiría almacenar múltiples lecturas asociadas a cada monitoreo y construir una serie temporal por sensor, zona y tipo de lectura.

A partir de ese histórico, implementaría inicialmente un módulo simple de análisis predictivo que pudiera evolucionar en dos niveles:

1. **Nivel inicial:** detección de anomalías mediante reglas estadísticas, como media móvil, desviación estándar, cambios bruscos y comparación contra umbrales dinámicos.
2. **Nivel avanzado:** entrenamiento de modelos de Machine Learning o Deep Learning para identificar patrones anómalos y anticipar posibles fallas.

En una versión más avanzada, podrían evaluarse modelos como redes neuronales recurrentes, LSTM, GRU o modelos basados en ventanas temporales para predecir el comportamiento esperado de una variable industrial. Por ejemplo, el sistema podría aprender la evolución normal de la temperatura, presión, vibración o flujo en una zona determinada y generar una alerta no solo cuando se supere un umbral fijo, sino cuando la lectura se aleje significativamente del patrón esperado.

Esta mejora tendría valor porque permitiría pasar de un sistema reactivo a un sistema con capacidades predictivas. En lugar de limitarse a responder cuando un valor ya superó el umbral, el sistema podría apoyar procesos de mantenimiento predictivo, detección temprana de fallas y priorización de zonas críticas.

En el frontend, esta mejora podría visualizarse mediante gráficas históricas por sensor, indicadores de tendencia y una alerta adicional de posible anomalía predictiva. De esta forma, el sistema no solo mostraría el estado actual del monitoreo, sino también la evolución del comportamiento del sensor en el tiempo.

No implementé esta funcionalidad en la versión actual porque requiere datos históricos suficientes para entrenar, validar y evaluar modelos de forma responsable. Para el alcance de esta prueba prioricé el cumplimiento de los requisitos principales: modelado relacional, endpoints solicitados, asignación de sensores a zonas, actualización de monitoreos, visualización de estados y alerta por umbral superado.



