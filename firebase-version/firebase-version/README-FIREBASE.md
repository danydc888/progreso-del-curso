# Configuración de Firebase para Progreso del Curso

## 🚀 Pasos para Configurar Firebase

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto: `progreso-del-curso` (o el nombre que prefieras)
4. Habilita Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### 2. Configurar Authentication

1. En el panel izquierdo, haz clic en "Authentication"
2. Haz clic en "Comenzar"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Google" como proveedor
5. Configura el nombre del proyecto y email de soporte
6. Guarda los cambios

### 3. Configurar Firestore Database

1. En el panel izquierdo, haz clic en "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (por ahora)
4. Elige una ubicación (preferiblemente cercana a tu región)
5. Haz clic en "Habilitar"

### 4. Obtener Configuración del Proyecto

1. En el panel izquierdo, haz clic en "Configuración del proyecto" (⚙️)
2. Desplázate hacia abajo hasta "Tus aplicaciones"
3. Haz clic en el ícono web (</>)
4. Registra tu app con un nombre: `Progreso del Curso Web`
5. **NO** marques "También configura Firebase Hosting"
6. Haz clic en "Registrar app"
7. Copia la configuración que aparece

### 5. Actualizar firebase-config.js

Reemplaza el contenido de `firebase-config.js` con tu configuración:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_REAL",
    authDomain: "tu-proyecto-real.firebaseapp.com",
    projectId: "tu-proyecto-real-id",
    storageBucket: "tu-proyecto-real.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 6. Configurar Reglas de Firestore

En Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Los usuarios solo pueden acceder a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Probar la Aplicación

1. Abre `Index.html` en tu navegador
2. Deberías ver un botón "Iniciar Sesión con Google"
3. Haz clic y autoriza la aplicación
4. Una vez autenticado, los datos se guardarán en Firebase

## 🔧 Funcionalidades Implementadas

### ✅ Autenticación
- Login con Google
- Logout
- Estado de autenticación persistente

### ✅ Almacenamiento de Datos
- Perfiles de usuario en Firestore
- Actividades sincronizadas en la nube
- Respaldo local como fallback

### ✅ Sincronización
- Datos se sincronizan automáticamente
- Funciona offline con respaldo local
- Múltiples usuarios pueden acceder a los mismos datos

## 🚨 Consideraciones de Seguridad

### Reglas de Firestore
- Los usuarios solo pueden acceder a sus propios datos
- Autenticación requerida para todas las operaciones
- Validación de permisos en cada consulta

### Privacidad
- Los datos se almacenan en la nube de Google
- Cada usuario tiene acceso solo a sus propios datos
- Los datos están encriptados en tránsito y en reposo

## 📱 Despliegue en Netlify

1. Sube la carpeta `firebase-version` a Netlify
2. La aplicación funcionará igual que antes
3. Los datos se sincronizarán automáticamente
4. Múltiples usuarios pueden acceder desde cualquier dispositivo

## 🔄 Migración de Datos Existentes

Si ya tienes datos en localStorage:
1. Los datos existentes se mantienen como respaldo
2. Al iniciar sesión, se crea una copia en Firebase
3. Los nuevos datos se guardan en ambos lugares
4. No se pierde información

## 🆘 Solución de Problemas

### Error de CORS
- Asegúrate de que el dominio esté autorizado en Firebase Console
- Ve a Authentication > Settings > Authorized domains

### Error de configuración
- Verifica que la configuración de Firebase sea correcta
- Revisa la consola del navegador para errores

### Datos no se sincronizan
- Verifica que las reglas de Firestore permitan el acceso
- Revisa que el usuario esté autenticado correctamente

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica la configuración de Firebase
3. Asegúrate de que las reglas de Firestore sean correctas

