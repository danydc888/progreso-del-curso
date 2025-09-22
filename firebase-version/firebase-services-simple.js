// Servicios de Firebase - Versión Simple
console.log('Cargando Firebase Services...');

class FirebaseService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        
        // Esperar a que Firebase esté listo
        window.addEventListener('firebaseReady', () => {
            console.log('Firebase listo, inicializando servicio...');
            this.init();
        });
    }

    async init() {
        try {
            console.log('Inicializando Firebase Service...');
            
            // Escuchar cambios de autenticación
            window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
                console.log('Estado de autenticación cambiado:', user ? 'Usuario logueado' : 'Usuario no logueado');
                this.currentUser = user;
                this.isInitialized = true;
                
                if (user) {
                    console.log('Usuario autenticado:', user.email);
                    this.updateUI();
                } else {
                    console.log('Usuario no autenticado - mostrando botón de login');
                    this.showLoginButton();
                }
            });
        } catch (error) {
            console.error('Error inicializando Firebase Service:', error);
            this.showError('Error conectando con Firebase: ' + error.message);
            this.showLoginButton();
        }
    }

    async signInWithGoogle() {
        try {
            console.log('Iniciando sesión con Google...');
            const result = await window.firebaseSignIn(window.firebaseAuth, window.firebaseProvider);
            console.log('Login exitoso:', result.user.email);
            return result.user;
        } catch (error) {
            console.error('Error en login:', error);
            this.showError('Error al iniciar sesión: ' + error.message);
            throw error;
        }
    }

    async signOut() {
        try {
            console.log('Cerrando sesión...');
            await window.firebaseSignOut(window.firebaseAuth);
            console.log('Logout exitoso');
        } catch (error) {
            console.error('Error en logout:', error);
            this.showError('Error al cerrar sesión: ' + error.message);
        }
    }

    updateUI() {
        console.log('Actualizando UI...');
        const userInfo = document.getElementById('user-info');
        if (userInfo && this.currentUser) {
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <img src="${this.currentUser.photoURL || 'https://via.placeholder.com/32'}" 
                         style="width: 32px; height: 32px; border-radius: 50%;">
                    <span style="font-weight: 600; color: #374151;">${this.currentUser.displayName || this.currentUser.email}</span>
                    <button onclick="firebaseService.signOut()" 
                            style="background: #ef4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Cerrar Sesión
                    </button>
                </div>
            `;
        }
    }

    showLoginButton() {
        console.log('Mostrando botón de login...');
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <button onclick="firebaseService.signInWithGoogle()" 
                        style="background: #4285f4; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 1rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Iniciar Sesión con Google
                </button>
            `;
            console.log('Botón de login mostrado correctamente');
        } else {
            console.error('No se encontró el elemento user-info');
        }
    }

    showError(message) {
        console.error(message);
        alert(message);
    }
}

// Crear instancia global
console.log('Creando instancia de FirebaseService...');
window.firebaseService = new FirebaseService();

