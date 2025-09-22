# 📱 Cómo Compartir la Aplicación con Otros Papás

## 🎯 **Resumen**

Esta aplicación permite que múltiples papás registren el progreso académico de sus hijos de forma independiente, pero también pueden compartir datos entre ellos para colaboración familiar.

## 📋 **Métodos de Compartir**

### **1. 📤 Exportar Datos Familiares**

#### **Para Compartir:**
1. Abre la aplicación en tu navegador
2. Ve a la pestaña **"Progreso"**
3. En la sección **"Datos Familiares"**, haz clic en **"Exportar Familia"**
4. Se descargará un archivo `.json` con todos los datos
5. Comparte este archivo con otros papás por:
   - **WhatsApp** - Envía el archivo por chat
   - **Email** - Adjunta el archivo al correo
   - **Google Drive** - Sube el archivo y comparte el enlace
   - **USB** - Copia el archivo a una memoria USB

#### **Para Recibir:**
1. Recibe el archivo de otro papá
2. Ve a la pestaña **"Progreso"**
3. En la sección **"Datos Familiares"**, haz clic en **"Importar Familia"**
4. Selecciona el archivo recibido
5. Elige una opción de importación:
   - **Reemplazar todos los datos** - Borra todo y carga los nuevos datos
   - **Fusionar con datos existentes** - Combina los datos nuevos con los actuales
   - **Solo importar perfiles** - Solo agrega los perfiles de alumnos

### **2. 🔄 Sincronización Manual**

#### **Proceso de Sincronización:**
1. **Papá A** exporta sus datos
2. **Papá B** importa los datos de Papá A
3. **Papá B** hace cambios y exporta sus datos actualizados
4. **Papá A** importa los datos actualizados de Papá B
5. Repetir el proceso según sea necesario

#### **Resolución de Conflictos:**
- La aplicación detecta automáticamente datos duplicados
- Los datos más recientes tienen prioridad
- Se crea un respaldo automático antes de cada importación

### **3. 📱 Códigos QR (En Desarrollo)**

#### **Generar QR:**
1. Ve a la pestaña **"Progreso"**
2. En la sección **"Compartir con Otros Papás"**, haz clic en **"Generar QR"**
3. Se mostrará un código QR con los datos
4. Otros papás pueden escanear este código para importar datos

#### **Escanear QR:**
1. Haz clic en **"Escanear QR"**
2. Toma una foto del código QR
3. Los datos se importarán automáticamente

## ⚙️ **Configuración Familiar**

### **Configurar Nombre de Familia:**
1. Ve a la pestaña **"Progreso"**
2. En la sección **"Configuración"**, haz clic en **"Configurar"**
3. Ingresa el nombre de tu familia
4. Configura opciones de respaldo automático
5. Guarda la configuración

### **Respaldos Automáticos:**
- **Diario** - Crea respaldo cada día
- **Semanal** - Crea respaldo cada semana
- **Mensual** - Crea respaldo cada mes
- **Nunca** - No crea respaldos automáticos

## 🔒 **Privacidad y Seguridad**

### **Datos Locales:**
- ✅ Todos los datos se guardan en tu dispositivo
- ✅ No se envían a servidores externos
- ✅ Control total de la información
- ✅ Cumple con regulaciones de privacidad

### **Compartir Seguro:**
- ✅ Solo comparte archivos con personas de confianza
- ✅ Los archivos contienen solo datos académicos
- ✅ No incluyen información personal sensible
- ✅ Puedes ver exactamente qué datos se comparten

## 📊 **Información de Sincronización**

### **Estadísticas Disponibles:**
- **Última exportación** - Cuándo se exportaron los datos por última vez
- **Última importación** - Cuándo se importaron datos por última vez
- **Respaldo disponible** - Si hay un respaldo de seguridad

### **Ubicación de los Datos:**
- **Perfiles** - `localStorage: course_progress_profiles`
- **Materias** - `localStorage: course_progress_subjects_[profileId]`
- **Calificaciones** - `localStorage: course_progress_grades_[profileId]`
- **Configuración** - `localStorage: course_progress_family_name`

## 🚀 **Casos de Uso Comunes**

### **1. Compartir entre Papá y Mamá:**
- Ambos pueden usar la misma aplicación
- Exportan/importan datos regularmente
- Mantienen sincronización de información

### **2. Cambio de Dispositivo:**
- Exporta datos del dispositivo viejo
- Importa datos en el dispositivo nuevo
- Continúa sin perder información

### **3. Respaldo de Seguridad:**
- Exporta datos mensualmente
- Guarda archivos en Google Drive
- Restaura en caso de pérdida

### **4. Colaboración Familiar:**
- Múltiples familiares registran datos
- Sincronizan información regularmente
- Mantienen historial completo

## ❓ **Preguntas Frecuentes**

### **¿Se pueden usar múltiples perfiles?**
Sí, cada familia puede tener múltiples perfiles de alumnos.

### **¿Los datos se pierden si cambio de dispositivo?**
No, puedes exportar los datos del dispositivo actual e importarlos en el nuevo.

### **¿Es seguro compartir los archivos?**
Sí, los archivos solo contienen datos académicos y no información personal sensible.

### **¿Puedo usar la aplicación sin internet?**
Sí, la aplicación funciona completamente offline.

### **¿Qué pasa si importo datos incorrectos?**
Siempre se crea un respaldo antes de importar, puedes restaurarlo si es necesario.

## 📞 **Soporte**

Si tienes problemas o preguntas:
1. Revisa esta guía de instrucciones
2. Verifica que el archivo sea válido
3. Intenta restaurar desde el respaldo
4. Contacta al desarrollador si persiste el problema

---

**¡Disfruta registrando el progreso académico de tus hijos! 🎓📚**
