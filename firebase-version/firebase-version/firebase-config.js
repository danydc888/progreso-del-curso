// Configuración de Firebase
// Configuración real del proyecto "progreso-del-curso"

const firebaseConfig = {
    apiKey: "AIzaSyBDfCnPZnY5RMp5DGDLKXklcAHDJUGdbOs",
    authDomain: "progreso-del-curso.firebaseapp.com",
    projectId: "progreso-del-curso",
    storageBucket: "progreso-del-curso.firebasestorage.app",
    messagingSenderId: "494825516539",
    appId: "1:494825516539:web:925cfa0dd0c0a7999cef5e"
};

// Inicializar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Configurar el proveedor de Google
provider.setCustomParameters({
    prompt: 'select_account'
});

// Exportar para uso en otros archivos
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseProvider = provider;
window.firebaseSignIn = signInWithPopup;
window.firebaseSignOut = signOut;
window.firebaseOnAuthStateChanged = onAuthStateChanged;
window.firebaseDoc = doc;
window.firebaseSetDoc = setDoc;
window.firebaseGetDoc = getDoc;
window.firebaseCollection = collection;
window.firebaseAddDoc = addDoc;
window.firebaseQuery = query;
window.firebaseWhere = where;
window.firebaseGetDocs = getDocs;
window.firebaseOrderBy = orderBy;
window.firebaseOnSnapshot = onSnapshot;
