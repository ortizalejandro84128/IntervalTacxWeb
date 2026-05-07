class NotificationManager {
    constructor() {
        this.overlay = null;
        this.iconContainer = null;
        this.textContainer = null;
        this.timer = null;
        this._createMarkup();
    }

    // Método para manejar la pausa
    togglePausa(isPausado) {
        if (isPausado) {
            const iconPausa = `<svg viewBox="0 0 16 16" fill="white"><path d="M5.5 3.5A.5.5 0 0 1 6 4v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/></svg>`;
            this.iconContainer.innerHTML = iconPausa;
            this.textContainer.innerHTML = "PAUSA";
            this.overlay.classList.add('show');
            
            if (this.timer) clearTimeout(this.timer); // Evita que un show() previo lo cierre
        } else {
            this.overlay.classList.remove('show');
        }
    }

    _createMarkup() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'trainer-notification-overlay';
        this.overlay.className = 'bg-dark bg-opacity-75 d-flex flex-column text-white';

        // Al hacer click en el overlay, simplemente lo ocultamos
        this.overlay.onclick = () => {
            this.togglePausa(false);
        };

        const content = document.createElement('div');
        content.className = 'text-center p-5';

        this.iconContainer = document.createElement('div');
        this.iconContainer.className = 'notification-icon-wrapper mb-4';

        this.textContainer = document.createElement('h1');
        this.textContainer.className = 'display-4 fw-bold text-uppercase';

        content.appendChild(this.iconContainer);
        content.appendChild(this.textContainer);
        this.overlay.appendChild(content);
        document.body.appendChild(this.overlay);
    }

    show(svgMarkup, text, duration = 1200) {
        if (this.timer) clearTimeout(this.timer);

        this.iconContainer.innerHTML = svgMarkup;
        this.textContainer.innerHTML = text;
        this.overlay.classList.add('show');

        this.timer = setTimeout(() => {
            this.overlay.classList.remove('show');
        }, duration);
    }
}

// --- DICCIONARIO DE ICONOS (Original e Intacto) ---
const ICONS = {
    START: `<svg viewBox="0 0 16 16" fill="white"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>`,
    NEXT: `<svg viewBox="0 0 16 16" fill="white"><path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>`,
    WARNING: `<svg viewBox="0 0 16 16" fill="#ffc107"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
    FINISH: `<svg viewBox="0 0 16 16" fill="white"><path d="M0 4.5A.5.5 0 0 1 .5 4H2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-7zm4 0a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1-.5-.5v-7zm4 0a.5.5 0 0 1 .5-.5H10a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H8.5a.5.5 0 0 1-.5-.5v-7zm4 0a.5.5 0 0 1 .5-.5H14a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H12.5a.5.5 0 0 1-.5-.5v-7z"/></svg>`
};