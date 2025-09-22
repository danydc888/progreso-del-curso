// libro.js

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const book = params.get('book');
    const container = document.getElementById('book-detail-container');
    const title = document.getElementById('book-title');

    const bookNames = {
        lam: 'LIBRO LAM',
        brainquest: 'BRAINQUEST',
        matific: 'MATIFIC',
        duoabc: 'DUO ABC',
        starfall: 'STARFALL'
    };

    const bookTitles = {
        lam: 'Progreso de Libro LAM',
        brainquest: 'Progreso de Libro Brainquest',
        matific: 'MATIFIC',
        duoabc: 'Detalle de Duo ABC',
        starfall: 'Detalle de Starfall'
    };

    // Cambiar títulos para que sean solo el nombre del libro
    if (book === 'apps') {
        renderAppsTable();
        title.textContent = 'APPS';
        return;
    }
    
    // Verificar si es una actividad personalizada tipo libro
    if (book.startsWith('custom_')) {
        const customActivityId = book.replace('custom_', '');
        const customActivity = getCustomActivity(customActivityId);
        if (customActivity && customActivity.category === 'libro') {
            title.textContent = `Progreso de ${customActivity.name}`;
            renderCustomBookTable(customActivity);
            return;
        }
        // Verificar si es una actividad personalizada tipo app
        if (customActivity && customActivity.category === 'app') {
            title.textContent = `Progreso de ${customActivity.name}`;
            renderCustomAppTable(customActivity);
            return;
        }
    }
    
    title.textContent = (book === 'matific' ? 'MATIFIC' : book === 'duoabc' ? 'DUO ABC' : book === 'starfall' ? 'STARFALL' : (bookTitles[book] || 'Detalle de Actividad'));

    if (book === 'lam' || book === 'brainquest') {
        renderPageTable(book);
    } else if (book === 'matific') {
        renderMatificSessionsTable();
    } else if (book === 'duoabc') {
        renderDuoabcSessionsTable();
    } else if (book === 'starfall') {
        renderStarfallSessionsTable();
    } else {
        renderBarChart(book);
    }
});

function getCurrentProfile() {
    const profile = sessionStorage.getItem('currentProfile');
    return profile ? JSON.parse(profile) : null;
}

function getActivities() {
    const profile = getCurrentProfile();
    if (!profile) return [];
    const data = localStorage.getItem(`course_progress_activities_${profile.id}`);
    return data ? JSON.parse(data) : [];
}

function getPageRange(book) {
    // Por defecto 1-300, pero configurable por localStorage
    const profile = getCurrentProfile();
    if (!profile) return {start: 1, end: 300};
    const key = `course_progress_${book}_pages_range_${profile.id}`;
    const range = localStorage.getItem(key);
    if (range) {
        try {
            return JSON.parse(range);
        } catch {
            return {start: 1, end: 300};
        }
    }
    return {start: 1, end: 300};
}

function setPageRange(book, start, end) {
    const profile = getCurrentProfile();
    if (!profile) return;
    const key = `course_progress_${book}_pages_range_${profile.id}`;
    localStorage.setItem(key, JSON.stringify({start, end}));
}

function renderPageTable(book) {
    const container = document.getElementById('book-detail-container');
    const range = getPageRange(book);
    const activities = getActivities();
    // Obtener todas las páginas hechas para este libro
    let pagesDone = new Set();
    activities.filter(a => a.book === book && a.description).forEach(a => {
        parsePages(a.description).forEach(p => pagesDone.add(p));
    });
    // Crear controles para rango
    container.innerHTML = `
        <div class="page-table-controls">
            <label>Rango de páginas:
                <input type="number" id="start-page" value="${range.start}" min="1" style="width:60px;"> -
                <input type="number" id="end-page" value="${range.end}" min="1" style="width:60px;">
                <button class="btn btn-primary" id="save-range">Guardar</button>
            </label>
        </div>
        <div class="page-table" id="page-table"></div>
    `;
    document.getElementById('save-range').onclick = () => {
        const start = parseInt(document.getElementById('start-page').value);
        const end = parseInt(document.getElementById('end-page').value);
        if (start > 0 && end >= start) {
            setPageRange(book, start, end);
            renderPageTable(book);
        }
    };
    // Renderizar tabla
    const table = document.getElementById('page-table');
    let html = '<div class="pages-grid">';
    for (let i = range.start; i <= range.end; i++) {
        html += `<div class="page-cell${pagesDone.has(i) ? ' done' : ''}">${i}</div>`;
    }
    html += '</div>';
    table.innerHTML = html;
}

function parsePages(desc) {
    // Soporta "1,2,3" y "5-10"
    let pages = new Set();
    desc.split(',').forEach(part => {
        part = part.trim();
        if (/^\d+-\d+$/.test(part)) {
            // Rango
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) pages.add(i);
        } else if (/^\d+$/.test(part)) {
            pages.add(Number(part));
        }
    });
    return Array.from(pages);
}

function renderBarChart(book) {
    const container = document.getElementById('book-detail-container');
    container.innerHTML = `
        <canvas id="book-bar-chart" height="300"></canvas>
    `;
    // Obtener actividades del ciclo escolar actual
    const activities = getActivities().filter(a => a.book === book);
    const profile = getCurrentProfile();
    const ciclo = profile && profile.cycle ? profile.cycle : '';
    // Determinar meses del ciclo escolar actual
    let months = [], weeks = [];
    if (ciclo) {
        // Ejemplo: "Ciclo 2025-2026" => 2025, 2026
        const match = ciclo.match(/(\d{4})-(\d{4})/);
        let startYear = new Date().getFullYear(), endYear = new Date().getFullYear();
        if (match) {
            startYear = parseInt(match[1]);
            endYear = parseInt(match[2]);
        }
        // Meses de agosto a julio
        months = [8,9,10,11,12,1,2,3,4,5,6,7];
        weeks = months.map(m => [1,2,3,4]);
    } else {
        // Si no hay ciclo, usar año actual
        const y = new Date().getFullYear();
        months = [1,2,3,4,5,6,7,8,9,10,11,12];
        weeks = months.map(m => [1,2,3,4]);
    }
    // Generar etiquetas
    const labels = [];
    months.forEach((m, i) => {
        for (let w = 1; w <= 4; w++) {
            labels.push(`${mesNombre(m)} S${w}`);
        }
    });
    // Contar actividades por semana
    const data = new Array(labels.length).fill(0);
    activities.forEach(a => {
        const d = new Date(a.date);
        let month = d.getMonth()+1;
        let year = d.getFullYear();
        // Ajustar meses de ciclo escolar (agosto-julio)
        if (months.includes(month)) {
            let idx = months.indexOf(month)*4 + Math.floor((d.getDate()-1)/7);
            data[idx]++;
        }
    });
    // Renderizar gráfica
    const ctx = document.getElementById('book-bar-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Actividades por semana',
                data: data,
                backgroundColor: getBookColor(book),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { stacked: true },
                y: { beginAtZero: true, stepSize: 1 }
            }
        }
    });
}

function renderMatificSessionsTable() {
    const container = document.getElementById('book-detail-container');
    // Ciclo escolar: septiembre (8) a julio (6)
    const months = [8,9,10,11,0,1,2,3,4,5,6];
    const monthNames = ['SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO'];
    const activities = getActivities().filter(a => a.book === 'matific');
    // Agrupar sesiones por mes
    let sessionsByMonth = Array(11).fill(0);
    activities.forEach(a => {
        const d = new Date(a.date);
        let m = d.getMonth();
        // Ajustar diciembre-enero (diciembre=11, enero=0)
        if (months.includes(m)) {
            let idx = months.indexOf(m);
            sessionsByMonth[idx]++;
        }
    });
    const total = sessionsByMonth.reduce((a,b) => a+b, 0);
    // Renderizar tabla
    let html = '<div class="matific-sessions-table">';
    sessionsByMonth.forEach((count, i) => {
        html += `<div class="matific-month-box">
            <div class="matific-month-label">${monthNames[i]}</div>
            <div class="matific-month-count">${count}</div>
        </div>`;
    });
    html += '</div>';
    html += `<div style="margin-top:2rem;text-align:center;font-weight:600;font-size:1.1rem;text-transform:uppercase;">TOTAL DE SESIONES DEL CICLO ESCOLAR</div>`;
    html += `<div style="text-align:center;font-size:2rem;font-weight:700;color:#f59e0b;">${total}</div>`;
    container.innerHTML = html;
}

function renderDuoabcSessionsTable() {
    const container = document.getElementById('book-detail-container');
    const months = [8,9,10,11,0,1,2,3,4,5,6];
    const monthNames = ['SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO'];
    const activities = getActivities().filter(a => a.book === 'duoabc');
    let sessionsByMonth = Array(11).fill(0);
    activities.forEach(a => {
        const d = new Date(a.date);
        let m = d.getMonth();
        if (months.includes(m)) {
            let idx = months.indexOf(m);
            sessionsByMonth[idx]++;
        }
    });
    const total = sessionsByMonth.reduce((a,b) => a+b, 0);
    let html = '<div class="matific-sessions-table">';
    sessionsByMonth.forEach((count, i) => {
        html += `<div class="matific-month-box" style="border-color:#10b98122;box-shadow:0 2px 8px rgba(16,185,129,0.08);">
            <div class="matific-month-label" style="color:#10b981;">${monthNames[i]}</div>
            <div class="matific-month-count" style="color:#10b981;">${count}</div>
        </div>`;
    });
    html += '</div>';
    html += `<div style="margin-top:2rem;text-align:center;font-weight:600;font-size:1.1rem;text-transform:uppercase;">TOTAL DE SESIONES DEL CICLO ESCOLAR</div>`;
    html += `<div style="text-align:center;font-size:2rem;font-weight:700;color:#10b981;">${total}</div>`;
    container.innerHTML = html;
}

function renderStarfallSessionsTable() {
    const container = document.getElementById('book-detail-container');
    const months = [8,9,10,11,0,1,2,3,4,5,6];
    const monthNames = ['SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO'];
    const activities = getActivities().filter(a => a.book === 'starfall');
    let sessionsByMonth = Array(11).fill(0);
    activities.forEach(a => {
        const d = new Date(a.date);
        let m = d.getMonth();
        if (months.includes(m)) {
            let idx = months.indexOf(m);
            sessionsByMonth[idx]++;
        }
    });
    const total = sessionsByMonth.reduce((a,b) => a+b, 0);
    let html = '<div class="matific-sessions-table">';
    sessionsByMonth.forEach((count, i) => {
        html += `<div class="matific-month-box" style="border-color:#ef444422;box-shadow:0 2px 8px rgba(239,68,68,0.08);">
            <div class="matific-month-label" style="color:#ef4444;">${monthNames[i]}</div>
            <div class="matific-month-count" style="color:#ef4444;">${count}</div>
        </div>`;
    });
    html += '</div>';
    html += `<div style="margin-top:2rem;text-align:center;font-weight:600;font-size:1.1rem;text-transform:uppercase;">TOTAL DE SESIONES DEL CICLO ESCOLAR</div>`;
    html += `<div style="text-align:center;font-size:2rem;font-weight:700;color:#ef4444;">${total}</div>`;
    container.innerHTML = html;
}

function renderAppsTable() {
    const container = document.getElementById('book-detail-container');
    const months = [8,9,10,11,0,1,2,3,4,5,6];
    const monthNames = ['SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO'];
    const apps = [
        { key: 'matific', label: 'MATIFIC', color: '#ef4444' },
        { key: 'duoabc', label: 'DUO ABC', color: '#10b981' },
        { key: 'starfall', label: 'STARFALL', color: '#f59e0b' }
    ];
    let html = '<div style="text-align:center;font-size:1.35rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.7rem;">CANTIDAD DE SESIONES TRABAJADAS</div>';
    html += '<div style="display:flex;gap:2.5rem;flex-wrap:nowrap;justify-content:center;max-width:980px;margin:0 auto;">';
    apps.forEach(app => {
        // Iconos representativos
        let icon = '';
        if(app.key === 'matific') icon = '<i class="fas fa-calculator"></i>';
        if(app.key === 'duoabc') icon = '<i class="fas fa-language"></i>';
        if(app.key === 'starfall') icon = '<i class="fas fa-star"></i>';
        const activities = getActivities().filter(a => a.book === app.key);
        let sessionsByMonth = Array(11).fill(0);
        activities.forEach(a => {
            const d = new Date(a.date);
            let m = d.getMonth();
            if (months.includes(m)) {
                let idx = months.indexOf(m);
                sessionsByMonth[idx]++;
            }
        });
        const total = sessionsByMonth.reduce((a,b) => a+b, 0);
        html += `<div style="background:#f8fafc;border-radius:18px;box-shadow:0 4px 18px rgba(59,130,246,0.07);padding:0.8rem 0.6rem;display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:182px;max-width:224px;border:5px solid ${app.color};">`;
        // Título horizontal arriba de la tabla (10% más pequeño adicional)
        html += `<div style="font-size:1.62rem;font-weight:900;letter-spacing:0.08em;color:${app.color};text-align:center;margin-bottom:0.3rem;line-height:1;">${app.label} <span style="font-size:0.63em;">${icon}</span></div>`;
        html += `<table style="border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden;">`;
        html += `<tr>
                <td style="font-weight:600;text-align:left;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-size:0.85rem;">${monthNames[0]}</td>
                <td style="text-align:center;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-weight:700;color:${app.color};font-size:0.85rem;">${sessionsByMonth[0]}</td>
            </tr>`;
        for(let i=1;i<11;i++){
            html += `<tr>
                <td style="font-weight:600;text-align:left;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-size:0.85rem;">${monthNames[i]}</td>
                <td style="text-align:center;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-weight:700;color:${app.color};font-size:0.85rem;">${sessionsByMonth[i]}</td>
            </tr>`;
        }
        html += `<tr>
            <td colspan="2" style="font-weight:700;text-transform:uppercase;text-align:center;padding:0.3rem 0.5rem;border-top:2px solid #222;background:#f3f4f6;font-size:0.8rem;">TOTAL DE SESIONES DEL CICLO ESCOLAR</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align:center;font-size:1.1rem;font-weight:700;color:${app.color};padding:0.3rem 0.5rem;">${total}</td>
        </tr>`;
        html += '</table></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function mesNombre(m) {
    return ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m-1] || '';
}

function getBookColor(book) {
    const colors = {
        matific: 'rgba(239, 68, 68, 0.8)',
        duoabc: 'rgba(16, 185, 129, 0.8)',
        starfall: 'rgba(245, 158, 11, 0.8)'
    };
    return colors[book] || 'rgba(59, 130, 246, 0.8)';
}

// Funciones para actividades personalizadas
function getCustomActivity(activityId) {
    const profile = getCurrentProfile();
    if (!profile) return null;
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    return customActivities.find(activity => activity.id === activityId);
}

function getCustomBookPageRange(activityId) {
    const profile = getCurrentProfile();
    if (!profile) return {start: 1, end: 300};
    const key = `course_progress_custom_${activityId}_pages_range_${profile.id}`;
    const range = localStorage.getItem(key);
    if (range) {
        try {
            return JSON.parse(range);
        } catch {
            return {start: 1, end: 300};
        }
    }
    return {start: 1, end: 300};
}

function setCustomBookPageRange(activityId, start, end) {
    const profile = getCurrentProfile();
    if (!profile) return;
    const key = `course_progress_custom_${activityId}_pages_range_${profile.id}`;
    localStorage.setItem(key, JSON.stringify({start, end}));
}

function renderCustomBookTable(customActivity) {
    const container = document.getElementById('book-detail-container');
    const range = getCustomBookPageRange(customActivity.id);
    const activities = getActivities();
    
    // Obtener todas las páginas hechas para este libro personalizado
    let pagesDone = new Set();
    const bookActivities = activities.filter(a => a.book === `custom_${customActivity.id}` && a.description);
    bookActivities.forEach(a => {
        const pages = parsePages(a.description);
        pages.forEach(p => pagesDone.add(p));
    });
    
    // Crear controles para rango
    container.innerHTML = `
        <div class="page-table-controls">
            <label>Rango de páginas:
                <input type="number" id="start-page" value="${range.start}" min="1" style="width:60px;"> -
                <input type="number" id="end-page" value="${range.end}" min="1" style="width:60px;">
                <button class="btn btn-primary" id="save-range">Guardar</button>
            </label>
        </div>
        <div class="page-table" id="page-table"></div>
    `;
    
    // Event listener para guardar rango
    document.getElementById('save-range').addEventListener('click', () => {
        const start = parseInt(document.getElementById('start-page').value);
        const end = parseInt(document.getElementById('end-page').value);
        if (start && end && start <= end) {
            setCustomBookPageRange(customActivity.id, start, end);
            renderCustomBookTable(customActivity); // Re-renderizar
        }
    });
    
    // Renderizar tabla de páginas
    renderCustomPageTable(customActivity, range, pagesDone);
}

function renderCustomPageTable(customActivity, range, pagesDone) {
    const table = document.getElementById('page-table');
    
    // Usar el mismo formato de cuadrícula que LAM y Brainquest
    let html = '<div class="pages-grid">';
    for (let i = range.start; i <= range.end; i++) {
        html += `<div class="page-cell${pagesDone.has(i) ? ' done' : ''}">${i}</div>`;
    }
    html += '</div>';
    
    table.innerHTML = html;
}

// Función para renderizar tabla de app personalizada
function renderCustomAppTable(customActivity) {
    const container = document.getElementById('book-detail-container');
    const months = [8,9,10,11,0,1,2,3,4,5,6];
    const monthNames = ['SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO'];
    const activities = getActivities().filter(a => a.book === `custom_${customActivity.id}`);
    
    // Agrupar sesiones por mes
    let sessionsByMonth = Array(11).fill(0);
    activities.forEach(a => {
        const d = new Date(a.date);
        let m = d.getMonth();
        if (months.includes(m)) {
            let idx = months.indexOf(m);
            sessionsByMonth[idx]++;
        }
    });
    
    const total = sessionsByMonth.reduce((a,b) => a+b, 0);
    
    // Obtener color de la actividad personalizada
    const colorMap = {
        'blue': '#3b82f6', 'purple': '#8b5cf6', 'red': '#ef4444', 'green': '#10b981',
        'orange': '#f59e0b', 'pink': '#ec4899', 'teal': '#14b8a6', 'indigo': '#6366f1',
        'yellow': '#eab308', 'emerald': '#059669', 'rose': '#f43f5e', 'slate': '#64748b'
    };
    const appColor = colorMap[customActivity.color] || '#3b82f6';
    
    // Renderizar tabla similar a las apps por defecto
    let html = '<div style="text-align:center;font-size:1.35rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.7rem;">CANTIDAD DE SESIONES TRABAJADAS</div>';
    html += '<div style="display:flex;gap:2.5rem;flex-wrap:nowrap;justify-content:center;max-width:980px;margin:0 auto;">';
    
    // Icono de la actividad personalizada
    const icon = customActivity.icon || 'fas fa-mobile-alt';
    
    html += `<div style="background:#f8fafc;border-radius:18px;box-shadow:0 4px 18px rgba(59,130,246,0.07);padding:0.8rem 0.6rem;display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:182px;max-width:224px;border:5px solid ${appColor};">`;
    // Título horizontal arriba de la tabla (10% más pequeño adicional)
    html += `<div style="font-size:1.62rem;font-weight:900;letter-spacing:0.08em;color:${appColor};text-align:center;margin-bottom:0.3rem;line-height:1;">${customActivity.name.toUpperCase()} <i class="${icon}" style="font-size:0.63em;"></i></div>`;
    html += `<table style="border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden;">`;
    html += `<tr>
            <td style="font-weight:600;text-align:left;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-size:0.85rem;">${monthNames[0]}</td>
            <td style="text-align:center;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-weight:700;color:${appColor};font-size:0.85rem;">${sessionsByMonth[0]}</td>
        </tr>`;
    
    for(let i=1;i<11;i++){
        html += `<tr>
            <td style="font-weight:600;text-align:left;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-size:0.85rem;">${monthNames[i]}</td>
            <td style="text-align:center;padding:0.2rem 0.5rem;border-bottom:1px solid #e5e7eb;font-weight:700;color:${appColor};font-size:0.85rem;">${sessionsByMonth[i]}</td>
        </tr>`;
    }
    
    html += `<tr>
        <td colspan="2" style="font-weight:700;text-transform:uppercase;text-align:center;padding:0.3rem 0.5rem;border-top:2px solid #222;background:#f3f4f6;font-size:0.8rem;">TOTAL DE SESIONES DEL CICLO ESCOLAR</td>
    </tr>
    <tr>
        <td colspan="2" style="text-align:center;font-size:1.1rem;font-weight:700;color:${appColor};padding:0.3rem 0.5rem;">${total}</td>
    </tr>`;
    html += '</table></div>';
    html += '</div>';
    
    container.innerHTML = html;
}

// Función de prueba para verificar que las páginas se registren correctamente
function testCustomBookPages() {
    console.log('=== PRUEBA DE PÁGINAS DE LIBRO PERSONALIZADO ===');
    
    const profile = getCurrentProfile();
    if (!profile) {
        console.log('No hay perfil activo');
        return;
    }
    
    const activities = getActivities();
    console.log('Todas las actividades:', activities);
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    console.log('Actividades personalizadas:', customActivities);
    
    const customBooks = customActivities.filter(a => a.category === 'libro');
    console.log('Libros personalizados:', customBooks);
    
    customBooks.forEach(book => {
        const bookActivities = activities.filter(a => a.book === `custom_${book.id}` && a.description);
        console.log(`Actividades del libro "${book.name}":`, bookActivities);
        
        let pagesDone = new Set();
        bookActivities.forEach(a => {
            const pages = parsePages(a.description);
            pages.forEach(p => pagesDone.add(p));
        });
        console.log(`Páginas completadas de "${book.name}":`, Array.from(pagesDone));
    });
}
