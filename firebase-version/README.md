# Progreso del Curso - Registro Escolar

Una aplicación web responsiva para registrar y monitorear el progreso académico de tu hijo durante el ciclo escolar.

## Características

### 👤 **Sistema de Perfiles Múltiples**
- Página de selección de perfiles similar a Netflix
- 5 avatares diferentes para personalizar cada perfil
- Información del alumno (nombre, grado escolar, escuela)
- Cambio rápido entre perfiles de diferentes alumnos
- Datos completamente separados por perfil

### 📱 **Totalmente Responsiva**
- Optimizada para Android, iPad, tablets y navegadores web
- Interfaz adaptativa que se ajusta a cualquier tamaño de pantalla
- Navegación táctil optimizada para dispositivos móviles

### 📊 **Dashboard Completo**
- Estadísticas en tiempo real del progreso académico
- Promedio general calculado automáticamente
- Resumen de calificaciones recientes
- Contador de materias y calificaciones registradas

### 📚 **Gestión de Materias**
- Agregar y editar materias del curso
- Asignar profesores y colores personalizados
- Estadísticas individuales por materia
- Eliminación segura con confirmación

### ⭐ **Registro de Calificaciones**
- Sistema de calificaciones de 0 a 10
- Filtros por materia y período
- Descripción opcional para cada calificación
- Fechas automáticas y manuales

### 📈 **Visualizaciones**
- Gráficos de barras para promedios por materia
- Gráfico de líneas para progreso por período
- Colores dinámicos según el rendimiento
- Charts interactivos y responsivos

### 💾 **Persistencia de Datos**
- Almacenamiento local en el navegador
- Exportar datos en formato JSON
- Importar datos desde archivos JSON
- Respaldo automático de la información

## Cómo Usar

### 1. **Configuración Inicial**
1. Abre el archivo `profiles.html` en tu navegador web
2. Crea el primer perfil del alumno seleccionando un avatar
3. Completa la información del alumno (nombre, grado, escuela)
4. Una vez creado el perfil, serás redirigido a la aplicación principal

### 2. **Gestión de Perfiles**
1. En la página de perfiles puedes crear múltiples perfiles
2. Cada perfil tiene sus propios datos completamente separados
3. Haz clic en un perfil para acceder a sus datos
4. Usa el botón "Cambiar Perfil" para volver a la selección

### 3. **Agregar Materias**
1. Haz clic en la pestaña "Materias"
2. Presiona el botón "Agregar Materia"
3. Completa el formulario:
   - Nombre de la materia
   - Profesor (opcional)
   - Color para identificación
4. Guarda la materia

### 4. **Registrar Calificaciones**
1. Ve a la pestaña "Calificaciones"
2. Haz clic en "Agregar Calificación"
3. Completa la información:
   - Selecciona la materia
   - Ingresa la calificación (0-10)
   - Elige el período (1-4)
   - Añade una descripción (opcional)
   - Selecciona la fecha
4. Guarda la calificación

### 5. **Monitorear Progreso**
1. Usa la pestaña "Dashboard" para ver estadísticas generales
2. Ve a "Progreso" para visualizar gráficos detallados
3. Filtra calificaciones por materia o período

### 6. **Exportar/Importar Datos**
1. Ve a la pestaña "Progreso"
2. Usa "Exportar Datos" para crear un respaldo
3. Usa "Importar Datos" para restaurar información

## Archivos Incluidos

- `profiles.html` - Página de selección de perfiles de alumnos
- `profiles.css` - Estilos para la página de perfiles
- `profiles.js` - Lógica de gestión de perfiles
- `index.html` - Página principal de la aplicación
- `styles.css` - Estilos CSS responsivos
- `app.js` - Lógica de la aplicación JavaScript
- `README.md` - Este archivo de documentación

## Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Almacenamiento local disponible

## Características Técnicas

### **Responsive Design**
- Mobile First approach
- Breakpoints para móviles, tablets y desktop
- Navegación optimizada para touch
- Tipografía escalable

### **Almacenamiento**
- LocalStorage para persistencia
- Datos en formato JSON
- Exportación/importación completa
- Validación de datos

### **Performance**
- Carga rápida sin dependencias externas
- Charts optimizados con Chart.js
- Animaciones suaves y ligeras
- Código JavaScript modular

## Personalización

### **Colores de Calificaciones**
- Verde (9-10): Excelente
- Azul (8-8.9): Bueno
- Amarillo (7-7.9): Regular
- Rojo (0-6.9): Necesita mejorar

### **Períodos Escolares**
- Período 1: Primer trimestre
- Período 2: Segundo trimestre
- Período 3: Tercer trimestre
- Período 4: Cuarto trimestre

## Soporte

Esta aplicación funciona completamente offline una vez cargada en el navegador. Los datos se almacenan localmente en tu dispositivo.

### **Resolución de Problemas**
- Si los datos no se guardan, verifica que JavaScript esté habilitado
- Para respaldar datos, usa la función de exportar regularmente
- En caso de problemas, puedes limpiar el almacenamiento local y comenzar de nuevo

## Licencia

Esta aplicación es de uso libre para fines educativos y personales.
