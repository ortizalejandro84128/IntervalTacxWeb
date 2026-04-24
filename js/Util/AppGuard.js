class AppGuard {
    constructor() {
        this.wakeLock = null;
        this.isProtected = false;
    }

    /**
     * Activa la protección contra cierres accidentales y el retroceso de página.
     */
    preventExit() {
        // Bloqueo de cierre/recarga
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = '';
        });

        // Bloqueo de Backspace (excepto en inputs)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const tag = e.target.tagName.toLowerCase();
                const isEditable = e.target.isContentEditable;
                const isInput = tag === 'input' || tag === 'textarea' || isEditable;
                if (!isInput) e.preventDefault();
            }
        });

        console.log("🛡️ Protección de navegación activada.");
    }

    /**
     * Activa el bloqueo de suspensión de pantalla (Wake Lock).
     */
    keepScreenAwake() {
        const requestLock = async () => {
            try {
                if ('wakeLock' in navigator && !this.wakeLock) {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                    console.log("☀️ Pantalla bloqueada: No se apagará.");

                    this.wakeLock.addEventListener('release', () => {
                        this.wakeLock = null;
                        console.log("🌙 Bloqueo de pantalla liberado.");
                    });
                }
            } catch (err) {
                console.error(`AppGuard - Error WakeLock: ${err.message}`);
            }
        };

        // Solicitar al interactuar (requisito del navegador)
        document.addEventListener('click', requestLock, { once: true });

        // Re-activar si la pestaña vuelve a ser visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') requestLock();
        });
    }
}

// Instancia única para uso global
