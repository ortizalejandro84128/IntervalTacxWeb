/*class AppGuard {
    constructor() {
        this.wakeLock = null;
        this.isProtected = false;
    }

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
}*/

class AppGuard {
    constructor() {
        this.wakeLock = null;
        this.isProtected = false;
        this.exitMessage = "¿Estás seguro de que quieres salir? Se perderá el progreso.";
        
        // Binds para asegurar que 'this' apunte a la clase
        this.handlePopState = this.handlePopState.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    }

    /**
     * Activa todas las protecciones (Cierre, Atrás y Pantalla encendida).
     */
    activate() {
        if (this.isProtected) return;
        this.isProtected = true;

        // 1. Evitar cierre/recarga (Escritorio y gestos Android)
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // 2. Interceptar botón "Atrás" en Android
        // Creamos un estado "falso" en el historial
        window.history.pushState({ protected: true }, null, window.location.pathname);
        window.addEventListener('popstate', this.handlePopState);

        // 3. Bloqueo de Backspace en teclado físico
        window.addEventListener('keydown', this.handleBackspace);

        // 4. Iniciar Wake Lock
        this.keepScreenAwake();

        console.log("🛡️ AppGuard: Todas las protecciones activadas.");
    }

    /**
     * Desactiva las protecciones para permitir navegación libre.
     */
    disable() {
        this.isProtected = false;
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('popstate', this.handlePopState);
        
        if (this.wakeLock) {
            this.wakeLock.release().then(() => {
                this.wakeLock = null;
            });
        }
        console.log("🔓 AppGuard: Protecciones desactivadas.");
    }

    handlePopState(event) {
        if (confirm(this.exitMessage)) {
            this.disable();
            window.history.back(); // Sale realmente
        } else {
            // Si cancela, volvemos a empujar el estado para que el botón "Atrás" siga bloqueado
            window.history.pushState({ protected: true }, null, window.location.pathname);
        }
    }

    handleBeforeUnload(e) {
        e.preventDefault();
        return (e.returnValue = '');
    }

    handleBackspace(e) {
        if (e.key === 'Backspace') {
            const tag = e.target.tagName.toLowerCase();
            const isInput = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
            if (!isInput) e.preventDefault();
        }
    }

    async keepScreenAwake() {
        const requestLock = async () => {
            try {
                if ('wakeLock' in navigator && !this.wakeLock && document.visibilityState === 'visible') {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.error("AppGuard - WakeLock Error:", err.message);
            }
        };

        await requestLock();
        // Re-activar si el usuario cambia de pestaña y vuelve
        document.addEventListener('visibilitychange', requestLock);
    }
}

// Instancia única para uso global
