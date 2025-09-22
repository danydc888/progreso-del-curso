@echo off
cd /d "D:\Dany\Juegos\Progreso del Curso\firebase-version"
echo Iniciando servidor en el directorio: %CD%
echo.
echo Archivos disponibles:
dir *.html
echo.
echo Servidor iniciado en http://localhost:8000
echo Presiona Ctrl+C para detener el servidor
echo.
python -m http.server 8000

