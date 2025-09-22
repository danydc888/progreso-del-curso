// Configuración de Firebase - Versión Simple
console.log('Cargando Firebase...');

// Configuración real del proyecto "progreso-del-curso"
const firebaseConfig = {
    apiKey: "AIzaSyBDfCnPZnY5RMp5DGDLKXklcAHDJUGdbOs",
    authDomain: "progreso-del-curso.firebaseapp.com",
    projectId: "progreso-del-curso",
    storageBucket: "progreso-del-curso.firebasestorage.app",
    messagingSenderId: "494825516539",
    appId: "1:494825516539:web:925cfa0dd0c0a7999cef5e"
};

// Cargar Firebase desde CDN
const script1 = document.createElement('script');
script1.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
script1.onload = () => {
    console.log('Firebase App cargado');
    
    const script2 = document.createElement('script');
    script2.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
    script2.onload = () => {
        console.log('Firebase Auth cargado');
        
        const script3 = document.createElement('script');
        script3.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
        script3.onload = () => {
            console.log('Firebase Firestore cargado');
            
            // Inicializar Firebase
            const app = firebase.initializeApp(firebaseConfig);
            const auth = firebase.auth();
            const db = firebase.firestore();
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Configurar el proveedor de Google
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            // Exportar para uso en otros archivos
            window.firebaseAuth = auth;
            window.firebaseDb = db;
            window.firebaseProvider = provider;
            window.firebaseSignIn = firebase.auth().signInWithPopup;
            window.firebaseSignOut = firebase.auth().signOut;
            window.firebaseOnAuthStateChanged = firebase.auth().onAuthStateChanged;
            window.firebaseDoc = firebase.firestore().doc;
            window.firebaseSetDoc = firebase.firestore().setDoc;
            window.firebaseGetDoc = firebase.firestore().getDoc;
            window.firebaseCollection = firebase.firestore().collection;
            window.firebaseAddDoc = firebase.firestore().addDoc;
            window.firebaseQuery = firebase.firestore().query;
            window.firebaseWhere = firebase.firestore().where;
            window.firebaseGetDocs = firebase.firestore().getDocs;
            window.firebaseOrderBy = firebase.firestore().orderBy;
            window.firebaseOnSnapshot = firebase.firestore().onSnapshot;
            
            console.log('Firebase inicializado correctamente');
            
            // Disparar evento personalizado cuando Firebase esté listo
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        };
        document.head.appendChild(script3);
    };
    document.head.appendChild(script2);
};
document.head.appendChild(script1);

