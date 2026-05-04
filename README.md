# IntervalTacxWeb
IntervalTacxWeb 🚴‍♂️⚡
IntervalTacxWeb es una plataforma de entrenamiento indoor de alto rendimiento, diseñada bajo la filosofía de cero dependencias y máxima portabilidad. Es una herramienta de "autor" creada para eliminar la fricción de las suscripciones costosas, la dependencia de servidores externos y la obsolescencia programada del hardware.

🔗 Pruébalo ahora: https://ortizalejandro84128.github.io/IntervalTacxWeb/

✨ Características Principales
Soberanía Digital: Funciona totalmente offline (vía sistema de archivos file://) o servido en web. Tus datos no salen de tu dispositivo.

Compatibilidad Híbrida de Hardware:

Rodillos Inteligentes: Control total vía ANT+ FE-C (over BT) y FTMS.

Configuración Tradicional: Soporte para rodillos "mudos" combinados con un potenciómetro externo (protocolo CPS).

Sensores: Conexión simultánea de banda de pulso (HR), cadencia y potencia sin interferencias.

Entrenamiento Estructurado Avanzado: Carga de archivos ERG, generador dinámico de sesiones y escalado en tiempo real basado en tu FTP.

Física de Precisión: Cálculo de velocidad virtual mediante el algoritmo estimateSpeed, que utiliza potencia real y masa para una telemetría coherente.

Power Ramping (Suavizado): Transiciones graduales de potencia entre intervalos para proteger la transmisión del rodillo y evitar la fatiga muscular brusca.

Feedback en Tiempo Real: Alertas sonoras/visuales antes de cada cambio, visualización por colores de intensidad y resumen detallado post-sesión (TSS, medias, etc.).

🛠 Ingeniería y Arquitectura
Motor Vanilla JS: Cero frameworks. Máximo rendimiento, latencia mínima y ejecución fluida en dispositivos Android.

Layout Elástico Vectorial: Interfaz responsiva con coordenadas dinámicas. Soporta modos Horizontal y Vertical con escalado automático para pantallas pequeñas.

Bucle de Control Estable: Envío de comandos cada 2 segundos, optimizado para la estabilidad del stack Bluetooth (probado exhaustivamente con Tacx Flow Smart).

Estética Profesional: Integración de temas Bootstrap con soporte para Modo Oscuro y Claro.

Exportación Estándar: Generación de archivos .TCX listos para Strava, TrainingPeaks o Garmin Connect.

📋 Requisitos del Sistema
Navegador compatible con Web Bluetooth API: Google Chrome o Microsoft Edge (v56+) en Escritorio o Android. (Safari y Firefox no soportados).

Hardware Soportado:

Rodillos inteligentes (BT LE).

Potenciómetros de bicicleta (BT LE).

Bandas de frecuencia cardíaca (BT LE).

Seguridad: Ejecución preferible vía HTTPS (GitHub Pages) o localhost para habilitar las funciones Bluetooth del navegador.

💡 La Filosofía del Proyecto
Este proyecto nace para eliminar la fricción:

Contra el software inflado: Sin suscripciones ni requisitos de hardware excesivos.

Contra la obsolescencia: Soporte real para hardware que las grandes marcas han dejado de lado (especialmente la línea Tacx Smart).

Simplicidad Extrema: Un solo archivo, sin instalaciones, abrir y pedalear.

IntervalTacxWeb - Creado por un ciclista, para ciclistas. Sin fricción, solo potencia.
