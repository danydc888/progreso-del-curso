// Aplicación de Progreso del Curso
class CourseProgressApp {
    constructor() {
        this.currentProfile = this.getCurrentProfile();
        this.activities = this.loadData('activities') || [];
        this.currentTab = 'dashboard';
        this.charts = {};
        this.currentDate = new Date();
        this.selectedDate = null;
        
        this.init();
    }

    getCurrentProfile() {
        const profile = sessionStorage.getItem('currentProfile');
        console.log('getCurrentProfile - sessionStorage profile:', profile);
        if (!profile) {
            // Redirect to profiles page if no profile selected
            console.log('No profile found, redirecting to profiles.html');
            window.location.href = 'profiles.html';
            return null;
        }
        const parsedProfile = JSON.parse(profile);
        console.log('getCurrentProfile - parsed profile:', parsedProfile);
        return parsedProfile;
    }

    init() {
        console.log('=== INIT START ===');
        console.log('Current profile at init:', this.currentProfile);
        this.setupEventListeners();
        this.setupCalendar();
        this.renderCalendar();
        this.updateStats();
        this.setupCharts();
        this.updateSyncInfo();
        
        // Asegurar que el placeholder se muestre correctamente al inicializar
        this.initializeCalendarPlaceholder();
        
        // Llamar displayCurrentProfile después de que el DOM esté listo
        setTimeout(() => {
            console.log('About to call displayCurrentProfile...');
            this.displayCurrentProfile();
            console.log('displayCurrentProfile called');
        }, 500);
        
        // También intentar después de que la ventana esté completamente cargada
        window.addEventListener('load', () => {
            console.log('Window loaded, calling displayCurrentProfile again...');
            this.displayCurrentProfile();
        });
        
        // Función de respaldo que se ejecuta cada segundo hasta que funcione
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
            attempts++;
            console.log(`Attempt ${attempts} to display profile...`);
            
            // Forzar la visualización directamente
            const profileAvatar = document.getElementById('profile-avatar');
            const profileName = document.getElementById('profile-name');
            
            if (profileAvatar && profileName) {
                const profileData = sessionStorage.getItem('currentProfile');
                if (profileData) {
                    const profile = JSON.parse(profileData);
                    const initials = profile.name
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase())
                        .join('')
                        .substring(0, 2);
                    
                    profileAvatar.textContent = initials;
                    profileName.textContent = profile.name;
                    profileAvatar.style.backgroundColor = '#3b82f6';
                    
                    console.log('Profile displayed successfully:', initials, profile.name);
                    clearInterval(interval);
                } else {
                    profileAvatar.textContent = '?';
                    profileName.textContent = 'Sin perfil';
                    profileAvatar.style.backgroundColor = '#ccc';
                }
            }
            
            if (attempts >= maxAttempts) {
                console.log('Max attempts reached, stopping interval');
                clearInterval(interval);
            }
        }, 500);
        
        console.log('=== INIT END ===');
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Modal buttons
        document.getElementById('add-activity-btn').addEventListener('click', () => {
            this.openModal('add-activity-modal');
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Forms
        document.getElementById('add-activity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addActivity();
        });

        // Filters
        const bookFilter = document.getElementById('book-filter');
        if (bookFilter) {
            bookFilter.addEventListener('change', () => {
                this.renderActivities();
            });
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.renderActivities();
            });
        }

        // Calendar controls
        const prevYear = document.getElementById('prev-year');
        if (prevYear) {
            prevYear.addEventListener('click', () => {
                this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
                this.renderCalendar();
            });
        }

        const nextYear = document.getElementById('next-year');
        if (nextYear) {
            nextYear.addEventListener('click', () => {
                this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
                this.renderCalendar();
            });
        }

        const prevMonth = document.getElementById('prev-month');
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        const nextMonth = document.getElementById('next-month');
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.currentDate.setFullYear(parseInt(e.target.value));
                this.renderCalendar();
            });
        }

        // Activity book selection
        document.getElementById('activity-book').addEventListener('change', (e) => {
            this.toggleDescriptionField(e.target.value);
        });

        // Change profile button
        document.getElementById('change-profile-btn').addEventListener('click', () => {
            window.location.href = 'profiles.html';
        });
    }

    // Tab Management
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Manejar el placeholder del calendario
        if (tabName === 'dashboard') {
            const placeholder = document.getElementById('activities-placeholder');
            const dailySection = document.getElementById('daily-activities');
            
            if (placeholder && dailySection) {
                // Si no hay día seleccionado, mostrar placeholder
                if (!window.selectedDate) {
                    placeholder.style.display = 'block';
                    dailySection.style.display = 'none';
                } else {
                    // Si hay día seleccionado, ocultar placeholder y mostrar actividades
                    placeholder.style.display = 'none';
                    dailySection.style.display = 'block';
                }
            }
        }

        // Update charts when switching to progress tab
        if (tabName === 'progress') {
            this.updateCharts();
        }
    }

    // Inicializar el placeholder del calendario
    initializeCalendarPlaceholder() {
        const placeholder = document.getElementById('activities-placeholder');
        const dailySection = document.getElementById('daily-activities');
        
        if (placeholder && dailySection) {
            // Si no hay día seleccionado, mostrar placeholder
            if (!window.selectedDate) {
                placeholder.style.display = 'block';
                dailySection.style.display = 'none';
            } else {
                // Si hay día seleccionado, ocultar placeholder y mostrar actividades
                placeholder.style.display = 'none';
                dailySection.style.display = 'block';
            }
        }
    }

    // Mostrar perfil actual en el header
    displayCurrentProfile() {
        console.log('=== displayCurrentProfile START ===');
        const profileAvatar = document.getElementById('profile-avatar');
        const profileName = document.getElementById('profile-name');
        
        console.log('Elements found:', { 
            profileAvatar: !!profileAvatar, 
            profileName: !!profileName,
            currentProfile: this.currentProfile 
        });
        
        if (!profileAvatar || !profileName) {
            console.log('Profile elements not found');
            return;
        }
        
        // Obtener perfil desde sessionStorage si no está en this.currentProfile
        let currentProfile = this.currentProfile;
        if (!currentProfile) {
            const profileData = sessionStorage.getItem('currentProfile');
            if (profileData) {
                currentProfile = JSON.parse(profileData);
                console.log('Loaded profile from sessionStorage:', currentProfile);
            }
        }
        
        if (!currentProfile) {
            console.log('No current profile found');
            profileAvatar.textContent = '?';
            profileName.textContent = 'Sin perfil';
            profileAvatar.style.backgroundColor = '#ccc';
            return;
        }
        
        // Generar iniciales del nombre
        const initials = currentProfile.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
        
        console.log('Setting profile info:', { initials, name: currentProfile.name });
        
        // Actualizar avatar con iniciales
        profileAvatar.textContent = initials;
        
        // Actualizar nombre del perfil
        profileName.textContent = currentProfile.name;
        
        // Aplicar color del perfil al avatar si existe
        if (currentProfile.color) {
            const colorMap = {
                'blue': '#3b82f6',
                'purple': '#8b5cf6', 
                'red': '#ef4444',
                'green': '#10b981',
                'orange': '#f59e0b',
                'pink': '#ec4899',
                'teal': '#14b8a6',
                'indigo': '#6366f1',
                'yellow': '#eab308',
                'emerald': '#059669',
                'rose': '#f43f5e',
                'slate': '#64748b'
            };
            const color = colorMap[currentProfile.color] || '#3b82f6';
            profileAvatar.style.backgroundColor = color;
            console.log('Applied color:', color);
        } else {
            // Color por defecto si no hay color específico
            profileAvatar.style.backgroundColor = '#3b82f6';
        }
        
        console.log('=== displayCurrentProfile END ===');
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Populate subject select in grade modal
        if (modalId === 'add-grade-modal') {
            this.populateSubjectSelect();
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset forms
        modal.querySelector('form').reset();
    }

    // Data Management
    saveData(key, data) {
        if (!this.currentProfile) return;
        localStorage.setItem(`course_progress_${key}_${this.currentProfile.id}`, JSON.stringify(data));
    }

    loadData(key) {
        if (!this.currentProfile) return [];
        const data = localStorage.getItem(`course_progress_${key}_${this.currentProfile.id}`);
        return data ? JSON.parse(data) : [];
    }

    // Activity Management
    addActivity() {
        const book = document.getElementById('activity-book').value;
        const description = document.getElementById('activity-description').value.trim();
        const notes = document.getElementById('activity-notes').value.trim();
        const date = document.getElementById('activity-date').value;

        if (!book || !date) return;

        // For books that don't need description, check if description is required
        const noDescriptionBooks = ['matific', 'duoabc', 'starfall'];
        if (!noDescriptionBooks.includes(book) && !description) return;

        const activity = {
            id: Date.now().toString(),
            book,
            description: noDescriptionBooks.includes(book) ? '' : description,
            notes,
            date,
            createdAt: new Date().toISOString()
        };

        this.activities.push(activity);
        this.saveData('activities', this.activities);
        
        this.closeModal(document.getElementById('add-activity-modal'));
        this.renderCalendar();
        this.updateStats();
        this.renderActivities();
        this.showNotification('Actividad agregada correctamente', 'success');
    }

    deleteSubject(subjectId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta materia? También se eliminarán todas las calificaciones asociadas.')) {
            this.subjects = this.subjects.filter(s => s.id !== subjectId);
            this.grades = this.grades.filter(g => g.subjectId !== subjectId);
            
            this.saveData('subjects', this.subjects);
            this.saveData('grades', this.grades);
            
            this.renderSubjects();
            this.renderGrades();
            this.updateDashboard();
            this.updateCharts();
        }
    }

    renderSubjects() {
        const container = document.getElementById('subjects-list');
        
        if (this.subjects.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-book-open"></i>
                    <p>No hay materias registradas</p>
                    <button class="btn btn-outline" onclick="document.getElementById('add-subject-btn').click()">
                        Agregar primera materia
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.subjects.map(subject => {
            const subjectGrades = this.grades.filter(g => g.subjectId === subject.id);
            const average = subjectGrades.length > 0 
                ? (subjectGrades.reduce((sum, g) => sum + g.value, 0) / subjectGrades.length).toFixed(1)
                : 0;

            return `
                <div class="subject-card" style="border-left-color: ${subject.color}">
                    <div class="subject-header">
                        <div>
                            <div class="subject-name">${subject.name}</div>
                            <div class="subject-teacher">${subject.teacher || 'Sin profesor'}</div>
                        </div>
                        <div class="subject-actions">
                            <button class="btn-icon" onclick="app.editSubject('${subject.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="app.deleteSubject('${subject.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="subject-stats">
                        <div class="stat-item">
                            <div class="stat-value">${subjectGrades.length}</div>
                            <div class="stat-label">Calificaciones</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${average}</div>
                            <div class="stat-label">Promedio</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Grade Management
    addGrade() {
        const subjectId = document.getElementById('grade-subject').value;
        const value = parseFloat(document.getElementById('grade-value').value);
        const period = parseInt(document.getElementById('grade-period').value);
        const description = document.getElementById('grade-description').value.trim();
        const date = document.getElementById('grade-date').value;

        if (!subjectId || isNaN(value)) return;

        const grade = {
            id: Date.now().toString(),
            subjectId,
            value,
            period,
            description,
            date,
            createdAt: new Date().toISOString()
        };

        this.grades.push(grade);
        this.saveData('grades', this.grades);
        
        this.closeModal(document.getElementById('add-grade-modal'));
        this.renderGrades();
        this.updateDashboard();
        this.updateCharts();
    }

    deleteGrade(gradeId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta calificación?')) {
            this.grades = this.grades.filter(g => g.id !== gradeId);
            this.saveData('grades', this.grades);
            
            this.renderGrades();
            this.updateDashboard();
            this.updateCharts();
        }
    }

    renderGrades() {
        const container = document.getElementById('grades-list');
        const subjectFilter = document.getElementById('subject-filter').value;
        const periodFilter = document.getElementById('period-filter').value;

        let filteredGrades = this.grades;

        if (subjectFilter) {
            filteredGrades = filteredGrades.filter(g => g.subjectId === subjectFilter);
        }

        if (periodFilter) {
            filteredGrades = filteredGrades.filter(g => g.period === parseInt(periodFilter));
        }

        // Sort by date (newest first)
        filteredGrades.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredGrades.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-star"></i>
                    <p>No hay calificaciones registradas</p>
                    <button class="btn btn-outline" onclick="document.getElementById('add-grade-btn').click()">
                        Agregar primera calificación
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredGrades.map(grade => {
            const subject = this.subjects.find(s => s.id === grade.subjectId);
            const gradeClass = this.getGradeClass(grade.value);

            return `
                <div class="grade-item">
                    <div class="grade-info">
                        <div class="grade-subject">${subject ? subject.name : 'Materia eliminada'}</div>
                        <div class="grade-description">${grade.description || 'Sin descripción'}</div>
                        <div class="grade-meta">
                            <span>Periodo ${grade.period}</span>
                            <span>${this.formatDate(grade.date)}</span>
                        </div>
                    </div>
                    <div class="grade-value ${gradeClass}">${grade.value}</div>
                    <div class="grade-actions">
                        <button class="btn-icon" onclick="app.deleteGrade('${grade.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Dashboard Updates
    updateDashboard() {
        // Update stats
        document.getElementById('total-subjects').textContent = this.subjects.length;
        document.getElementById('total-grades').textContent = this.grades.length;

        // Calculate average grade
        const average = this.grades.length > 0 
            ? (this.grades.reduce((sum, g) => sum + g.value, 0) / this.grades.length).toFixed(1)
            : 0;
        document.getElementById('average-grade').textContent = average;

        // Update recent grades
        this.renderRecentGrades();
    }

    renderRecentGrades() {
        const container = document.getElementById('recent-grades-list');
        const recentGrades = this.grades
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentGrades.length === 0) {
            container.innerHTML = '<p class="no-data">No hay calificaciones registradas</p>';
            return;
        }

        container.innerHTML = recentGrades.map(grade => {
            const subject = this.subjects.find(s => s.id === grade.subjectId);
            const gradeClass = this.getGradeClass(grade.value);

            return `
                <div class="grade-item">
                    <div class="grade-info">
                        <div class="grade-subject">${subject ? subject.name : 'Materia eliminada'}</div>
                        <div class="grade-meta">
                            <span>Periodo ${grade.period}</span>
                            <span>${this.formatDate(grade.date)}</span>
                        </div>
                    </div>
                    <div class="grade-value ${gradeClass}">${grade.value}</div>
                </div>
            `;
        }).join('');
    }

    // Charts
    setupCharts() {
        // Subjects chart
        const subjectsCtx = document.getElementById('subjects-chart');
        if (subjectsCtx) {
            this.charts.subjects = new Chart(subjectsCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Promedio',
                        data: [],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        // Periods chart
        const periodsCtx = document.getElementById('periods-chart');
        if (periodsCtx) {
            this.charts.periods = new Chart(periodsCtx, {
                type: 'line',
                data: {
                    labels: ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'],
                    datasets: [{
                        label: 'Promedio General',
                        data: [0, 0, 0, 0],
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    updateCharts() {
        if (!this.charts.subjects || !this.charts.periods) return;

        // Update subjects chart
        const subjectAverages = this.subjects.map(subject => {
            const subjectGrades = this.grades.filter(g => g.subjectId === subject.id);
            return {
                name: subject.name,
                average: subjectGrades.length > 0 
                    ? subjectGrades.reduce((sum, g) => sum + g.value, 0) / subjectGrades.length
                    : 0
            };
        });

        this.charts.subjects.data.labels = subjectAverages.map(s => s.name);
        this.charts.subjects.data.datasets[0].data = subjectAverages.map(s => s.average);
        this.charts.subjects.update();

        // Update periods chart
        const periodAverages = [1, 2, 3, 4].map(period => {
            const periodGrades = this.grades.filter(g => g.period === period);
            return periodGrades.length > 0 
                ? periodGrades.reduce((sum, g) => sum + g.value, 0) / periodGrades.length
                : 0;
        });

        this.charts.periods.data.datasets[0].data = periodAverages;
        this.charts.periods.update();
    }

    // Utility Functions
    populateSubjectSelect() {
        const select = document.getElementById('grade-subject');
        const filterSelect = document.getElementById('subject-filter');
        
        const options = this.subjects.map(subject => 
            `<option value="${subject.id}">${subject.name}</option>`
        ).join('');

        select.innerHTML = '<option value="">Seleccionar materia</option>' + options;
        filterSelect.innerHTML = '<option value="">Todas las materias</option>' + options;
    }

    getGradeClass(value) {
        if (value >= 9) return 'grade-excellent';
        if (value >= 8) return 'grade-good';
        if (value >= 7) return 'grade-average';
        return 'grade-poor';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Calendar Functions
    setupCalendar() {
        this.populateYearSelect();
        this.setCurrentDate();
    }

    populateYearSelect() {
        const yearSelect = document.getElementById('year-select');
        if (!yearSelect) {
            console.log('year-select element not found, skipping populateYearSelect');
            return;
        }
        
        const currentYear = new Date().getFullYear();
        
        // Add years from 2020 to current year + 2
        for (let year = 2020; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const activityDate = document.getElementById('activity-date');
        if (activityDate) {
            activityDate.value = today;
        }
    }

    toggleDescriptionField(selectedBook) {
        const descriptionGroup = document.getElementById('description-group');
        const descriptionInput = document.getElementById('activity-description');
        
        // Books that don't need description: matific, duoabc, starfall
        const noDescriptionBooks = ['matific', 'duoabc', 'starfall'];
        
        if (noDescriptionBooks.includes(selectedBook)) {
            descriptionGroup.style.display = 'none';
            descriptionInput.required = false;
            descriptionInput.value = ''; // Clear the field
        } else {
            descriptionGroup.style.display = 'block';
            descriptionInput.required = true;
        }
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYear = document.getElementById('current-month-year');
        
        // Update month/year display
        if (monthYear) {
            const monthNames = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            
            monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
        
        // Update year select
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearSelect.value = this.currentDate.getFullYear();
        }
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Clear calendar
        if (calendarGrid) {
            calendarGrid.innerHTML = '';
            
            // Add day headers
            const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            dayHeaders.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });
        }
        
        // Add empty cells for days before month starts
        if (calendarGrid) {
            for (let i = 0; i < startingDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day other-month';
                calendarGrid.appendChild(emptyDay);
            }
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-activities"></div>
            `;
            
            // Usar fecha local (no UTC)
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            // Formato YYYY-MM-DD en local
            const dateString = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
            
            // Check if today
            const today = new Date();
            if (
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()
            ) {
                dayElement.classList.add('today');
            }
            
            // Check if has activities
            const dayActivities = this.activities.filter(a => a.date === dateString);
            if (dayActivities.length > 0) {
                dayElement.classList.add('has-activities');
                
                // Add activity dots
                const activitiesContainer = dayElement.querySelector('.calendar-day-activities');
                dayActivities.forEach(activity => {
                    const dot = document.createElement('div');
                    dot.className = `activity-dot ${activity.book}`;
                    activitiesContainer.appendChild(dot);
                });
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                this.selectDate(dateString);
            });
            
            if (calendarGrid) {
                calendarGrid.appendChild(dayElement);
            }
        }
    }

    selectDate(dateString) {
        this.selectedDate = dateString;
        this.showDailyActivities(dateString);
    }

    showDailyActivities(dateString) {
        const dailyActivities = document.getElementById('daily-activities');
        const selectedDateElement = document.getElementById('selected-date');
        const activitiesList = document.getElementById('activities-list');
        
        // Show daily activities section
        dailyActivities.style.display = 'block';
        
        // Mostrar fecha local correctamente
        const [year, month, day] = dateString.split('-');
        const date = new Date(Number(year), Number(month)-1, Number(day));
        const formattedDate = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        selectedDateElement.textContent = formattedDate;
        
        // Get activities for this date
        const dayActivities = this.activities.filter(a => a.date === dateString);
        
        if (dayActivities.length === 0) {
            activitiesList.innerHTML = '<p class="no-data">No hay actividades registradas para este día</p>';
            return;
        }
        
        // Render activities
        activitiesList.innerHTML = dayActivities.map(activity => {
            const bookNames = {
                'lam': 'LIBRO LAM',
                'brainquest': 'BRAINQUEST',
                'matific': 'MATIFIC',
                'duoabc': 'DUO ABC',
                'starfall': 'STARFALL'
            };
            // Colores al 15% de opacidad (rgba)
            const bookColors = {
                'lam': 'rgba(59,130,246,0.15)', // azul
                'brainquest': 'rgba(16,185,129,0.15)', // verde
                'matific': 'rgba(239,68,68,0.15)', // rojo (ahora matific)
                'duoabc': 'rgba(59,130,246,0.10)', // azul claro
                'starfall': 'rgba(245,158,11,0.15)' // naranja (ahora starfall)
            };
            const borderColors = {
                'lam': '#3b82f6',
                'brainquest': '#10b981',
                'matific': '#ef4444',
                'duoabc': '#3b82f6',
                'starfall': '#f59e0b'
            };
            return `
                <div class="activity-item ${activity.book}" style="background:${bookColors[activity.book]};border-left:5px solid ${borderColors[activity.book]};border-radius:12px;margin-bottom:1.1em;padding:1em 1.2em 1em 1.1em;">
                    <div class="activity-header">
                        <div class="activity-book">${bookNames[activity.book]}</div>
                        <div class="activity-time">${this.formatDate(activity.date)}</div>
                    </div>
                    ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                    <div class="activity-actions">
                        <button class="btn-icon" onclick="app.deleteActivity('${activity.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }


    getGradeText(grade) {
        return grade || 'Sin grado';
    }

    // Activity Functions
    deleteActivity(activityId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            this.activities = this.activities.filter(a => a.id !== activityId);
            this.saveData('activities', this.activities);
            
            this.renderCalendar();
            this.updateStats();
            this.renderActivities();
            this.showNotification('Actividad eliminada correctamente', 'success');
        }
    }

    renderActivities() {
        const activitiesList = document.getElementById('activities-list');
        const bookFilter = document.getElementById('book-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        
        let filteredActivities = this.activities;
        
        if (bookFilter) {
            filteredActivities = filteredActivities.filter(a => a.book === bookFilter);
        }
        
        if (dateFilter) {
            filteredActivities = filteredActivities.filter(a => a.date === dateFilter);
        }
        
        // Sort by date (newest first)
        filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredActivities.length === 0) {
            activitiesList.innerHTML = '<div class="no-data"><i class="fas fa-tasks"></i><p>No hay actividades registradas</p></div>';
            return;
        }
        
        activitiesList.innerHTML = filteredActivities.map(activity => {
            const bookNames = {
                'lam': 'LIBRO LAM',
                'brainquest': 'BRAINQUEST',
                'matific': 'MATIFIC',
                'duoabc': 'DUO ABC',
                'starfall': 'STARFALL'
            };
            
            return `
                <div class="activity-item ${activity.book}">
                    <div class="activity-header">
                        <div class="activity-book">${bookNames[activity.book]}</div>
                        <div class="activity-time">${this.formatDate(activity.date)}</div>
                    </div>
                    ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                    <div class="activity-actions">
                        <button class="btn-icon" onclick="app.deleteActivity('${activity.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        // Filter activities for current month
        const monthActivities = this.activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
        });
        
        // Calculate stats
        const totalActivities = monthActivities.length;
        const activeDays = new Set(monthActivities.map(a => a.date)).size;
        const streakDays = this.calculateStreak();
        
        // Update UI
        document.getElementById('total-activities').textContent = totalActivities;
        document.getElementById('active-days').textContent = activeDays;
        document.getElementById('streak-days').textContent = streakDays;
        
        // Update book stats
        this.updateBookStats();
    }

    updateBookStats() {
        const books = ['lam', 'brainquest', 'matific', 'duoabc', 'starfall'];
        
        books.forEach(book => {
            const bookActivities = this.activities.filter(a => a.book === book);
            const bookDays = new Set(bookActivities.map(a => a.date)).size;
            
            document.getElementById(`${book}-activities`).textContent = bookActivities.length;
            document.getElementById(`${book}-days`).textContent = bookDays;
        });
    }

    calculateStreak() {
        if (this.activities.length === 0) return 0;
        
        // Sort activities by date
        const sortedActivities = [...this.activities].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        // Get unique dates
        const activityDates = [...new Set(sortedActivities.map(a => a.date))].sort((a, b) => new Date(b) - new Date(a));
        
        for (const dateString of activityDates) {
            const activityDate = new Date(dateString);
            const diffTime = currentDate - activityDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
                currentDate = new Date(activityDate);
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Export/Import functionality
    exportData() {
        const data = {
            activities: this.activities,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progreso_curso_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Export Family Data
    exportFamilyData() {
        const familyData = {
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
            familyName: this.getFamilyName(),
            currentProfile: this.currentProfile,
            profiles: this.getAllProfiles(),
            activities: this.activities,
            settings: this.getSettings()
        };
        
        const blob = new Blob([JSON.stringify(familyData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `familia_progreso_curso_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Save export timestamp
        localStorage.setItem('course_progress_last_export', new Date().toISOString());
        this.updateSyncInfo();
        
        this.showNotification('Datos familiares exportados correctamente', 'success');
    }

    getFamilyName() {
        // Try to get family name from localStorage or use current profile name
        const familyName = localStorage.getItem('course_progress_family_name');
        if (familyName) return familyName;
        
        if (this.currentProfile) {
            return `Familia ${this.currentProfile.name}`;
        }
        
        return 'Mi Familia';
    }

    getAllProfiles() {
        const profiles = localStorage.getItem('course_progress_profiles');
        return profiles ? JSON.parse(profiles) : [];
    }

    getSettings() {
        return {
            theme: 'light',
            language: 'es',
            lastSync: new Date().toISOString()
        };
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.activities) {
                    this.activities = data.activities;
                    this.saveData('activities', this.activities);
                    
                    this.renderCalendar();
                    this.updateStats();
                    this.renderActivities();
                    
                    this.showNotification('Datos importados correctamente', 'success');
                } else {
                    this.showNotification('Archivo de datos inválido', 'error');
                }
            } catch (error) {
                this.showNotification('Error al importar los datos: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Import Family Data
    importFamilyData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const familyData = JSON.parse(e.target.result);
                
                // Validate family data structure
                if (!this.validateFamilyData(familyData)) {
                    this.showNotification('Archivo de datos familiares inválido', 'error');
                    return;
                }

                // Show import options modal
                this.showImportOptionsModal(familyData);
                
            } catch (error) {
                this.showNotification('Error al leer el archivo: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    validateFamilyData(data) {
        return data.version && 
               data.exportedAt && 
               data.familyName && 
               Array.isArray(data.profiles) &&
               Array.isArray(data.activities);
    }

    showImportOptionsModal(familyData) {
        // Create modal for import options
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Importar Datos Familiares</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="import-info">
                        <h4>Datos a importar:</h4>
                        <p><strong>Familia:</strong> ${familyData.familyName}</p>
                        <p><strong>Perfiles:</strong> ${familyData.profiles.length}</p>
                        <p><strong>Materias:</strong> ${familyData.subjects.length}</p>
                        <p><strong>Calificaciones:</strong> ${familyData.grades.length}</p>
                        <p><strong>Exportado:</strong> ${this.formatDate(familyData.exportedAt)}</p>
                    </div>
                    
                    <div class="import-options">
                        <h4>Opciones de importación:</h4>
                        <label class="import-option">
                            <input type="radio" name="importMode" value="replace" checked>
                            <span>Reemplazar todos los datos actuales</span>
                        </label>
                        <label class="import-option">
                            <input type="radio" name="importMode" value="merge">
                            <span>Fusionar con datos existentes</span>
                        </label>
                        <label class="import-option">
                            <input type="radio" name="importMode" value="profiles-only">
                            <span>Solo importar perfiles</span>
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button class="btn btn-primary" onclick="app.executeImport('${btoa(JSON.stringify(familyData))}')">Importar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    executeImport(encodedData) {
        try {
            const familyData = JSON.parse(atob(encodedData));
            const importMode = document.querySelector('input[name="importMode"]:checked').value;
            
            // Create backup before importing
            this.createBackup();
            
            switch (importMode) {
                case 'replace':
                    this.replaceAllData(familyData);
                    break;
                case 'merge':
                    this.mergeFamilyData(familyData);
                    break;
                case 'profiles-only':
                    this.importProfilesOnly(familyData);
                    break;
            }
            
            // Close modal
            document.querySelector('.modal').remove();
            
            // Save import timestamp
            localStorage.setItem('course_progress_last_import', new Date().toISOString());
            this.updateSyncInfo();
            
            this.showNotification('Datos importados correctamente', 'success');
            
        } catch (error) {
            this.showNotification('Error al importar: ' + error.message, 'error');
        }
    }

    replaceAllData(familyData) {
        // Replace all data
        this.activities = familyData.activities || [];
        
        // Save family name
        if (familyData.familyName) {
            localStorage.setItem('course_progress_family_name', familyData.familyName);
        }
        
        // Save profiles
        if (familyData.profiles) {
            localStorage.setItem('course_progress_profiles', JSON.stringify(familyData.profiles));
        }
        
        // Save current data
        this.saveData('activities', this.activities);
        
        // Refresh UI
        this.renderCalendar();
        this.updateStats();
        this.renderActivities();
    }

    mergeFamilyData(familyData) {
        // Merge profiles
        if (familyData.profiles) {
            const existingProfiles = this.getAllProfiles();
            const mergedProfiles = this.mergeProfiles(existingProfiles, familyData.profiles);
            localStorage.setItem('course_progress_profiles', JSON.stringify(mergedProfiles));
        }
        
        // Merge activities
        this.activities = this.mergeArrays(this.activities, familyData.activities || [], 'id');
        
        // Save merged data
        this.saveData('activities', this.activities);
        
        // Refresh UI
        this.renderCalendar();
        this.updateStats();
        this.renderActivities();
    }

    importProfilesOnly(familyData) {
        if (familyData.profiles) {
            const existingProfiles = this.getAllProfiles();
            const mergedProfiles = this.mergeProfiles(existingProfiles, familyData.profiles);
            localStorage.setItem('course_progress_profiles', JSON.stringify(mergedProfiles));
        }
        
        this.showNotification('Perfiles importados correctamente', 'success');
    }

    mergeProfiles(existing, incoming) {
        const merged = [...existing];
        
        incoming.forEach(incomingProfile => {
            const existingIndex = merged.findIndex(p => p.id === incomingProfile.id);
            if (existingIndex >= 0) {
                // Update existing profile
                merged[existingIndex] = { ...merged[existingIndex], ...incomingProfile };
            } else {
                // Add new profile
                merged.push(incomingProfile);
            }
        });
        
        return merged;
    }

    mergeArrays(existing, incoming, keyField) {
        const merged = [...existing];
        
        incoming.forEach(incomingItem => {
            const existingIndex = merged.findIndex(item => item[keyField] === incomingItem[keyField]);
            if (existingIndex >= 0) {
                // Update existing item
                merged[existingIndex] = { ...merged[existingIndex], ...incomingItem };
            } else {
                // Add new item
                merged.push(incomingItem);
            }
        });
        
        return merged;
    }

    createBackup() {
        const backup = {
            activities: this.activities,
            profiles: this.getAllProfiles(),
            backupAt: new Date().toISOString()
        };
        
        localStorage.setItem('course_progress_backup', JSON.stringify(backup));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // QR Code functionality
    generateQRCode() {
        const familyData = {
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
            familyName: this.getFamilyName(),
            currentProfile: this.currentProfile,
            profiles: this.getAllProfiles(),
            subjects: this.subjects,
            grades: this.grades
        };
        
        const dataString = JSON.stringify(familyData);
        const qrData = btoa(dataString);
        
        this.showQRModal(qrData);
    }

    showQRModal(qrData) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Código QR para Compartir</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="qr-container">
                        <div id="qrcode" style="text-align: center; padding: 2rem;"></div>
                        <p style="text-align: center; color: var(--text-secondary); margin-top: 1rem;">
                            Escanea este código con la aplicación para importar los datos
                        </p>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary modal-close">Cerrar</button>
                        <button class="btn btn-primary" onclick="app.downloadQR()">Descargar QR</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Generate QR code using a simple method (you can use a QR library)
        this.generateSimpleQR(qrData);
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generateSimpleQR(data) {
        // Simple QR code generation (you can replace with a proper QR library)
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = `
            <div style="
                width: 200px; 
                height: 200px; 
                background: #f0f0f0; 
                border: 2px solid #ddd; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin: 0 auto;
                border-radius: 8px;
            ">
                <div style="text-align: center;">
                    <i class="fas fa-qrcode" style="font-size: 3rem; color: #666; margin-bottom: 0.5rem;"></i>
                    <div style="font-size: 0.75rem; color: #666;">Código QR</div>
                    <div style="font-size: 0.6rem; color: #999; margin-top: 0.25rem;">${data.substring(0, 20)}...</div>
                </div>
            </div>
        `;
    }

    scanQRCode() {
        // Simple file input for QR scanning
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.showNotification('Función de escaneo QR en desarrollo. Por ahora, usa la importación de archivos.', 'info');
            }
        };
        input.click();
    }

    // Family settings
    openFamilySettings() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configuración Familiar</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form id="family-settings-form">
                    <div class="form-group">
                        <label for="family-name">Nombre de la Familia</label>
                        <input type="text" id="family-name" value="${this.getFamilyName()}" placeholder="Ej: Familia García">
                    </div>
                    
                    <div class="form-group">
                        <label for="auto-backup">Respaldo Automático</label>
                        <select id="auto-backup">
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                            <option value="never">Nunca</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="sync-notifications">Notificaciones de Sincronización</label>
                        <select id="sync-notifications">
                            <option value="enabled">Habilitadas</option>
                            <option value="disabled">Deshabilitadas</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar Configuración</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('family-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFamilySettings();
            modal.remove();
        });
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveFamilySettings() {
        const familyName = document.getElementById('family-name').value;
        const autoBackup = document.getElementById('auto-backup').value;
        const syncNotifications = document.getElementById('sync-notifications').value;
        
        // Save settings
        localStorage.setItem('course_progress_family_name', familyName);
        localStorage.setItem('course_progress_auto_backup', autoBackup);
        localStorage.setItem('course_progress_sync_notifications', syncNotifications);
        
        this.showNotification('Configuración guardada correctamente', 'success');
    }

    // Restore backup
    restoreBackup() {
        const backup = localStorage.getItem('course_progress_backup');
        if (!backup) {
            this.showNotification('No hay respaldo disponible', 'error');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres restaurar el respaldo? Se perderán los datos actuales.')) {
            try {
                const backupData = JSON.parse(backup);
                
                // Restore data
                this.activities = backupData.activities || [];
                
                if (backupData.profiles) {
                    localStorage.setItem('course_progress_profiles', JSON.stringify(backupData.profiles));
                }
                
                // Save restored data
                this.saveData('activities', this.activities);
                
                // Refresh UI
                this.renderCalendar();
                this.updateStats();
                this.renderActivities();
                
                this.showNotification('Respaldo restaurado correctamente', 'success');
                
            } catch (error) {
                this.showNotification('Error al restaurar el respaldo: ' + error.message, 'error');
            }
        }
    }

    // Update sync info
    updateSyncInfo() {
        const lastExport = localStorage.getItem('course_progress_last_export');
        const lastImport = localStorage.getItem('course_progress_last_import');
        const backup = localStorage.getItem('course_progress_backup');
        
        document.getElementById('last-export').textContent = lastExport ? this.formatDate(lastExport) : 'Nunca';
        document.getElementById('last-import').textContent = lastImport ? this.formatDate(lastImport) : 'Nunca';
        document.getElementById('backup-status').textContent = backup ? 'Sí' : 'No';
    }
}

// --- NUEVO CALENDARIO DASHBOARD ---
// Variable global para la fecha seleccionada
window.selectedDate = null;

// Lógica para el calendario del dashboard
function renderDashboardCalendar() {
    const calendarTable = document.getElementById('calendar-table');
    const calendarTitle = document.getElementById('calendar-title');
    if (!calendarTable || !calendarTitle) return;

    // Estado del calendario
    if (!window._calendarDate) window._calendarDate = new Date();
    const date = window._calendarDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    // Título
    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    calendarTitle.textContent = `${monthNames[month]} ${year}`;

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0=Domingo

    // Obtener actividades del mes
    const profile = getCurrentProfile();
    let activities = [];
    if (profile) {
        activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
    }

    // Generar grid
    let html = '';
    // Header días
    const dayHeaders = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    for (let d = 0; d < 7; d++) {
        html += `<div class="calendar-header-day">${dayHeaders[d]}</div>`;
    }
    // Días vacíos antes del 1
    for (let i = 0; i < startDay; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }
    // Días del mes
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        let extraClass = '';
        if (dayOfWeek === 0) extraClass = ' sunday';
        if (dayOfWeek === 6) extraClass = ' saturday';
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        // Filtrar actividades de ese día
        const dayActs = activities.filter(a => a.date === dateStr);
        const hasActs = dayActs.length > 0;
        // Iconos únicos de libros
        const uniqueBooks = [...new Set(dayActs.map(a => a.book))];
        const bookIcons = {
            'lam': '<i class="fas fa-book" title="LIBRO LAM"></i>',
            'brainquest': '<i class="fas fa-brain" title="BRAINQUEST"></i>',
            'matific': '<i class="fas fa-calculator" title="MATIFIC"></i>',
            'duoabc': '<i class="fas fa-language" title="DUO ABC"></i>',
            'starfall': '<i class="fas fa-star" title="STARFALL"></i>'
        };
        
        // Función para obtener icono de actividad
        function getActivityIcon(book, activities) {
            if (book.startsWith('custom_')) {
                const activity = activities.find(a => a.book === book);
                if (activity && activity.customActivityIcon) {
                    return `<i class="${activity.customActivityIcon}" title="${activity.customActivityName || 'Actividad Personalizada'}"></i>`;
                }
                return '<i class="fas fa-plus" title="Actividad Personalizada"></i>';
            }
            return bookIcons[book] || '';
        }
        
        let iconsHtml = '';
        if (hasActs) {
            iconsHtml = '<div class="calendar-day-icons">' + uniqueBooks.map(b => getActivityIcon(b, dayActs)).join(' ') + '</div>';
        }
        html += `<div class="calendar-day${extraClass}${isToday ? ' today' : ''}${hasActs ? ' has-activities' : ''}" data-date="${dateStr}">
            <div>${day}</div>
            ${iconsHtml}
        </div>`;
    }
    calendarTable.innerHTML = html;

    // Click en días
    document.querySelectorAll('.calendar-day').forEach(cell => {
        if (!cell.classList.contains('other-month')) {
            cell.onclick = function() {
                document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                window.selectedDate = cell.getAttribute('data-date');
                showDailyActivities(cell.getAttribute('data-date'));
            };
        }
    });
}



function showDailyActivities(dateString) {
    const dailySection = document.getElementById('daily-activities');
    const selectedDate = document.getElementById('selected-date');
    const activitiesList = document.getElementById('activities-list');
    const placeholder = document.getElementById('activities-placeholder');
    if (!dailySection || !selectedDate || !activitiesList) return;
    
    // Ocultar el placeholder y mostrar la sección de actividades
    if (placeholder) placeholder.style.display = 'none';
    dailySection.style.display = 'block';
    
    const [y,m,d] = dateString.split('-');
    const date = new Date(Number(y), Number(m)-1, Number(d));
    selectedDate.textContent = date.toLocaleDateString('es-ES', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    
    // Establecer la fecha seleccionada globalmente
    window.selectedDate = dateString;
    const activities = getActivitiesForDate(dateString);
    if (activities.length === 0) {
        activitiesList.innerHTML = '<p class="no-data">No hay actividades registradas para este día</p>';
        return;
    }
    const bookIcons = {
        'lam': '<i class="fas fa-book" title="LIBRO LAM"></i>',
        'brainquest': '<i class="fas fa-brain" title="BRAINQUEST"></i>',
        'matific': '<i class="fas fa-calculator" title="MATIFIC"></i>',
        'duoabc': '<i class="fas fa-language" title="DUO ABC"></i>',
        'starfall': '<i class="fas fa-star" title="STARFALL"></i>'
    };
    const bookNames = {
        'lam': 'LIBRO LAM',
        'brainquest': 'BRAINQUEST',
        'matific': 'MATIFIC',
        'duoabc': 'DUO ABC',
        'starfall': 'STARFALL'
    };
    
    // Función para obtener icono y nombre de actividad
    function getActivityInfo(activity) {
        if (activity.book.startsWith('custom_')) {
            return {
                icon: `<i class="${activity.customActivityIcon || 'fas fa-plus'}" title="${activity.customActivityName || 'Actividad Personalizada'}"></i>`,
                name: activity.customActivityName || 'Actividad Personalizada'
            };
        } else {
            return {
                icon: bookIcons[activity.book] || '',
                name: bookNames[activity.book] || activity.book
            };
        }
    }
    activitiesList.innerHTML = activities.map(activity => {
        const activityInfo = getActivityInfo(activity);
        const noDescriptionBooks = ['matific','duoabc','starfall'];
        const isCustomApp = activity.book.startsWith('custom_') && !activity.book.includes('libro');
        
        // Obtener estilos para actividades personalizadas
        let customStyles = '';
        if (activity.book.startsWith('custom_')) {
            const colorMap = {
                'blue': '#3b82f6',
                'purple': '#8b5cf6',
                'red': '#ef4444',
                'green': '#10b981',
                'orange': '#f59e0b',
                'pink': '#ec4899',
                'teal': '#14b8a6',
                'indigo': '#6366f1',
                'yellow': '#eab308',
                'emerald': '#059669',
                'rose': '#f43f5e',
                'slate': '#64748b'
            };
            const color = colorMap[activity.customActivityColor] || '#3b82f6';
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            customStyles = `style="background:rgba(${r},${g},${b},0.15);border-left:4px solid ${color};"`;
        }
        
        if (window.editingActivityId && window.editingActivityId === activity.id) {
            // Edición inline
            return `
                <form class="activity-item ${activity.book} activity-edit-form" ${customStyles} onsubmit="return saveEditActivity('${activity.id}')">
                    <div class="activity-header">
                        <div class="activity-book">${activityInfo.icon} ${activityInfo.name}</div>
                    </div>
                    <div class="edit-fields">
                        <input type="text" class="edit-activity-description" name="description" placeholder="Descripción" value="${activity.description||''}" style="display:${noDescriptionBooks.includes(activity.book) || isCustomApp ?'none':'block'};margin-bottom:0.5rem;">
                        <textarea class="edit-activity-notes" name="notes" placeholder="Notas (opcional)" rows="2">${activity.notes||''}</textarea>
                    </div>
                    <div class="activity-actions">
                        <button type="button" class="btn btn-secondary" onclick="cancelEditActivity()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            `;
        } else {
            return `
                <div class="activity-item ${activity.book}" ${customStyles}>
                    <div class="activity-header">
                        <div class="activity-book">${activityInfo.icon} ${activityInfo.name}</div>
                    </div>
                    ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                    <div class="activity-actions">
                        <button class="btn btn-primary" onclick="editActivityInline('${activity.id}')" title="Editar"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-danger" onclick="deleteActivity('${activity.id}')" title="Eliminar"><i class="fas fa-trash"></i> Eliminar</button>
                    </div>
                </div>
            `;
        }
    }).join('');
    // Listeners para mostrar/ocultar descripción según libro seleccionado en edición
    document.querySelectorAll('.activity-edit-form .edit-activity-description').forEach(input => {
        const form = input.closest('form');
        const book = activities.find(a => a.id === window.editingActivityId)?.book;
        if (['matific','duoabc','starfall'].includes(book)) {
            input.style.display = 'none';
        } else {
            input.style.display = 'block';
        }
    });
}

function getActivitiesForDate(dateString) {
    // Obtener actividades del localStorage
    const profile = getCurrentProfile();
    if (!profile) return [];
    
    const activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
    return activities.filter(activity => activity.date === dateString);
}

function getCurrentProfile() {
    const profile = sessionStorage.getItem('currentProfile');
    return profile ? JSON.parse(profile) : null;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
}

function deleteActivity(activityId) {
    // Mostrar modal personalizado en vez de confirm()
    window._activityToDelete = activityId;
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Listener para el botón de confirmación
if (typeof window._deleteActivityModalSetup === 'undefined') {
    window._deleteActivityModalSetup = true;
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('confirm-delete-activity-btn');
        if (btn) {
            btn.onclick = function() {
                const activityId = window._activityToDelete;
                if (!activityId) return;
                const profile = getCurrentProfile();
                if (!profile) return;
                const activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
                const updatedActivities = activities.filter(a => a.id !== activityId);
                localStorage.setItem(`course_progress_activities_${profile.id}`, JSON.stringify(updatedActivities));
                // Refrescar la vista
                if (window.selectedDate) {
                    showDailyActivities(window.selectedDate);
                }
                renderDashboardCalendar && renderDashboardCalendar();
                
                // Refrescar vista semanal si está activa
                if (document.getElementById('week').classList.contains('active')) {
                    renderWeekView();
                }
                
                // Mostrar notificación
                showNotification('Actividad eliminada correctamente', 'success');
                
                // Cerrar modal
                closeDeleteConfirmModal();
            };
        }
    });
}

// Navegación
function setupCalendarNav() {
    document.getElementById('prev-month').onclick = () => {
        window._calendarDate.setMonth(window._calendarDate.getMonth() - 1);
        renderDashboardCalendar();
    };
    document.getElementById('next-month').onclick = () => {
        window._calendarDate.setMonth(window._calendarDate.getMonth() + 1);
        renderDashboardCalendar();
    };
}

// Función para agregar actividad (modificada)
function addActivity() {
    try {
        const book = document.getElementById('activity-book').value;
        const description = document.getElementById('activity-description').value.trim();
        const notes = document.getElementById('activity-notes').value.trim();
        const date = document.getElementById('activity-date').value;

        if (!book) {
            alert('Por favor selecciona un libro');
            return;
        }
        
        if (!date) {
            alert('Error: No se pudo obtener la fecha. Por favor intenta de nuevo.');
            return;
        }

        // For books that don't need description, check if description is required
        const noDescriptionBooks = ['matific', 'duoabc', 'starfall'];
        const isCustomActivity = book.startsWith('custom_');
        
        // Verificar si es una actividad personalizada tipo "libro"
        let isCustomBook = false;
        if (isCustomActivity) {
            const profile = getCurrentProfile();
            if (profile) {
                const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
                const customActivityId = book.replace('custom_', '');
                const customActivity = customActivities.find(a => a.id === customActivityId);
                isCustomBook = customActivity && customActivity.category === 'libro';
            }
        }
        
        if (!noDescriptionBooks.includes(book) && !(isCustomActivity && !isCustomBook) && !description) {
            alert('Por favor completa la descripción de la actividad');
            return;
        }

        const profile = getCurrentProfile();
        if (!profile) {
            alert('Error: No se encontró el perfil actual');
            return;
        }
        
        const activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
        
        if (window._editingActivityId) {
            // Editar actividad existente
            const activityIndex = activities.findIndex(a => a.id === window._editingActivityId);
            if (activityIndex !== -1) {
                activities[activityIndex] = {
                    ...activities[activityIndex],
                    book,
                    description: noDescriptionBooks.includes(book) ? '' : description,
                    notes,
                    date: date,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(`course_progress_activities_${profile.id}`, JSON.stringify(activities));
                showNotification('Actividad editada correctamente', 'success');
            }
            window._editingActivityId = null;
        } else {
            // Crear nueva actividad
            let activity;
            
            if (isCustomActivity) {
                // Obtener datos de la actividad personalizada
                const customActivityId = book.replace('custom_', '');
                const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
                const customActivity = customActivities.find(ca => ca.id === customActivityId);
                
                if (customActivity) {
                    activity = {
                        id: Date.now().toString(),
                        book: book,
                        customActivityId: customActivityId,
                        customActivityName: customActivity.name,
                        customActivityIcon: customActivity.icon,
                        customActivityColor: customActivity.color,
                        description: isCustomBook ? description : '',
                        notes,
                        date: date,
                        createdAt: new Date().toISOString()
                    };
                } else {
                    alert('Error: No se encontró la actividad personalizada');
                    return;
                }
            } else {
                activity = {
                    id: Date.now().toString(),
                    book,
                    description: noDescriptionBooks.includes(book) ? '' : description,
                    notes,
                    date: date,
                    createdAt: new Date().toISOString()
                };
            }
            
            activities.push(activity);
            localStorage.setItem(`course_progress_activities_${profile.id}`, JSON.stringify(activities));
            showNotification('Actividad agregada correctamente', 'success');
        }
        
        // Cerrar modal y limpiar formulario
        const modal = document.getElementById('add-activity-modal');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        document.body.style.overflow = '';
        document.getElementById('add-activity-form').reset();
        
        // Resetear campos ocultos
        document.getElementById('activity-book').value = '';
        document.getElementById('description-group').style.display = 'none';
        document.getElementById('notes-group').style.display = 'none';
        
        // Resetear título del modal
        modal.querySelector('h3').textContent = 'Agregar Actividad';
        
        // Refrescar la vista de actividades y el calendario
        if (window.selectedDate) {
            showDailyActivities(window.selectedDate);
        }
        renderDashboardCalendar();
        
        // Refrescar la vista semanal si está activa
        if (document.getElementById('week').classList.contains('active')) {
            renderWeekView();
        }
        
        // Mostrar notificación
        showNotification('Actividad agregada correctamente', 'success');
    } catch (error) {
        console.error('Error en addActivity:', error);
        alert('Error al agregar la actividad: ' + error.message);
    }
}

// Mostrar/ocultar campos según actividad seleccionada
function setupDescriptionFieldToggle() {
    const select = document.getElementById('activity-book');
    const descGroup = document.getElementById('description-group');
    const notesGroup = document.getElementById('notes-group');
    const descInput = document.getElementById('activity-description');
    if (!select || !descGroup || !notesGroup || !descInput) return;
    
    select.addEventListener('change', function() {
        const value = select.value;
        
        // Si no hay actividad seleccionada, ocultar todos los campos
        if (!value) {
            descGroup.style.display = 'none';
            notesGroup.style.display = 'none';
            descInput.required = false;
            descInput.value = '';
            return;
        }
        
        // Mostrar campo de notas siempre
        notesGroup.style.display = '';
        
        // Para actividades que no necesitan descripción, ocultar el campo
        const noDescriptionBooks = ['matific','duoabc','starfall'];
        const isCustomActivity = value.startsWith('custom_');
        
        // Verificar si es una actividad personalizada tipo "libro"
        let isCustomBook = false;
        if (isCustomActivity) {
            const profile = getCurrentProfile();
            if (profile) {
                const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
                const customActivityId = value.replace('custom_', '');
                const customActivity = customActivities.find(a => a.id === customActivityId);
                isCustomBook = customActivity && customActivity.category === 'libro';
            }
        }
        
        if (noDescriptionBooks.includes(value) || (isCustomActivity && !isCustomBook)) {
            descGroup.style.display = 'none';
            descInput.required = false;
            descInput.value = '';
        } else {
            descGroup.style.display = '';
            descInput.required = true;
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function activateTabFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    // Quitar 'active' de todas las tabs y contenidos
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    // Activar la tab y el contenido correspondiente
    const tabBtn = document.querySelector(`.nav-tab[data-tab="${hash}"]`);
    const tabContent = document.getElementById(hash);
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');
}
document.addEventListener('DOMContentLoaded', activateTabFromHash);
window.addEventListener('hashchange', activateTabFromHash);

document.addEventListener('DOMContentLoaded', () => {
    renderDashboardCalendar();
    setupCalendarNav();
    setupDescriptionFieldToggle();
    
    // Event listener para el botón de agregar actividad
    const addActivityBtn = document.getElementById('add-activity-btn');
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', () => {
            // Usar la fecha seleccionada en el calendario si existe, sino usar hoy
            const selectedDate = window.selectedDate || new Date().toISOString().split('T')[0];
            openAddActivityModal(selectedDate);
        });
    }
    
    // Event listener para el formulario de agregar actividad
    document.getElementById('add-activity-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addActivity();
    });
    
    // Event listeners para cerrar el modal
    const modal = document.getElementById('add-activity-modal');
    const closeBtns = modal.querySelectorAll('.modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            document.body.style.overflow = '';
            // Resetear formulario y campos
            document.getElementById('add-activity-form').reset();
            document.getElementById('activity-book').value = '';
            document.getElementById('description-group').style.display = 'none';
            document.getElementById('notes-group').style.display = 'none';
            modal.querySelector('h3').textContent = 'Agregar Actividad';
        });
    });
    
    // Cerrar modal al hacer clic fuera de él
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            document.body.style.overflow = '';
            // Resetear formulario y campos
            document.getElementById('add-activity-form').reset();
            document.getElementById('activity-book').value = '';
            document.getElementById('description-group').style.display = 'none';
            document.getElementById('notes-group').style.display = 'none';
            modal.querySelector('h3').textContent = 'Agregar Actividad';
        }
    });
    if (window.location.hash === '#books') {
        const booksTab = document.querySelector('[data-tab="books"]');
        if (booksTab) booksTab.click();
    }
});
// --- FIN NUEVO CALENDARIO ---

// --- NUEVO SELECTOR DE MESES ---
function renderMonthSelector() {
    const monthSelector = document.getElementById('calendar-month-selector');
    if (!monthSelector) return;
    // Ciclo escolar: septiembre a julio
    const months = [
        {num: 8, name: 'SEPTIEMBRE'},
        {num: 9, name: 'OCTUBRE'},
        {num: 10, name: 'NOVIEMBRE'},
        {num: 11, name: 'DICIEMBRE'},
        {num: 0, name: 'ENERO'},
        {num: 1, name: 'FEBRERO'},
        {num: 2, name: 'MARZO'},
        {num: 3, name: 'ABRIL'},
        {num: 4, name: 'MAYO'},
        {num: 5, name: 'JUNIO'},
        {num: 6, name: 'JULIO'}
    ];
    let currentMonth = (window._calendarDate || new Date()).getMonth();
    // Si el mes es enero-julio, el año es el siguiente al de septiembre-diciembre
    let currentYear = (window._calendarDate || new Date()).getFullYear();
    monthSelector.innerHTML = months.map(m =>
        `<button class="month-option${m.num === currentMonth ? ' selected' : ''}" data-month="${m.num}">${m.name}</button>`
    ).join('');
    // Listeners
    monthSelector.querySelectorAll('.month-option').forEach(btn => {
        btn.onclick = function() {
            const month = parseInt(btn.getAttribute('data-month'));
            window._calendarDate.setMonth(month);
            // Si el mes es enero-julio y el mes actual es septiembre-diciembre, aumentar año
            if (month <= 6 && currentMonth >= 8) {
                window._calendarDate.setFullYear(currentYear + 1);
            }
            // Si el mes es septiembre-diciembre y el mes actual es enero-julio, disminuir año
            if (month >= 8 && currentMonth <= 6) {
                window._calendarDate.setFullYear(currentYear - 1);
            }
            renderMonthSelector();
            renderDashboardCalendar();
        };
    });
}
// Llamar al renderizador de meses cuando se renderiza el calendario
const _oldRenderDashboardCalendar = renderDashboardCalendar;
renderDashboardCalendar = function() {
    renderMonthSelector();
    _oldRenderDashboardCalendar();
};
// --- FIN NUEVO SELECTOR DE MESES ---

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CourseProgressApp();
});

// Asegurar que el perfil se muestre cuando la página esté completamente cargada
window.addEventListener('load', () => {
    console.log('Window loaded, ensuring profile display...');
    if (window.app && window.app.displayCurrentProfile) {
        setTimeout(() => {
            window.app.displayCurrentProfile();
        }, 100);
    }
});

// Función global para forzar la visualización del perfil
window.forceProfileDisplay = function() {
    console.log('Forcing profile display...');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    
    if (profileAvatar && profileName) {
        const profileData = sessionStorage.getItem('currentProfile');
        if (profileData) {
            const profile = JSON.parse(profileData);
            const initials = profile.name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('')
                .substring(0, 2);
            
            profileAvatar.textContent = initials;
            profileName.textContent = profile.name;
            profileAvatar.style.backgroundColor = '#3b82f6';
            
            console.log('Profile forced:', initials, profile.name);
        } else {
            profileAvatar.textContent = '?';
            profileName.textContent = 'Sin perfil';
            profileAvatar.style.backgroundColor = '#ccc';
        }
    }
};

// Add export/import buttons to the interface
document.addEventListener('DOMContentLoaded', () => {
    const progressTab = document.getElementById('progress');
    if (progressTab) {
        const exportImportSection = document.createElement('div');
        exportImportSection.className = 'export-import-section';
        exportImportSection.innerHTML = `
            <div class="section-header">
                <h3>Exportar/Importar Datos</h3>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-outline" onclick="app.exportData()">
                    <i class="fas fa-download"></i> Exportar Datos
                </button>
                <label class="btn btn-outline" style="cursor: pointer;">
                    <i class="fas fa-upload"></i> Importar Datos
                    <input type="file" accept=".json" style="display: none;" onchange="app.importData(this.files[0])">
                </label>
            </div>
        `;
        
        progressTab.appendChild(exportImportSection);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('change-profile-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            window.location.href = 'profiles.html';
        });
    }
});

window.editActivityInline = function(id) {
    window.editingActivityId = id;
    if (window.selectedDate) showDailyActivities(window.selectedDate);
};

window.saveEditActivity = function(id) {
    if (window.event) window.event.preventDefault();
    const form = document.querySelector('.activity-edit-form');
    if (!form) return false;
    const description = form.querySelector('.edit-activity-description')?.value.trim() || '';
    const notes = form.querySelector('.edit-activity-notes')?.value.trim() || '';
    const profile = getCurrentProfile();
    if (!profile) return false;
    let activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
    let found = false;
    activities = activities.map(a => {
        if (String(a.id) === String(id)) {
            found = true;
            const noDescriptionBooks = ['matific','duoabc','starfall'];
            return {
                ...a,
                description: noDescriptionBooks.includes(a.book) ? '' : description,
                notes
            };
        }
        return a;
    });
    if (found) {
        localStorage.setItem(`course_progress_activities_${profile.id}`, JSON.stringify(activities));
        window.editingActivityId = null;
        if (window.selectedDate) showDailyActivities(window.selectedDate);
        renderDashboardCalendar && renderDashboardCalendar();
        showNotification('Actividad editada correctamente', 'success');
    } else {
        showNotification('No se encontró la actividad para editar', 'error');
    }
    return false;
};

window.cancelEditActivity = function() {
    window.editingActivityId = null;
    if (window.selectedDate) showDailyActivities(window.selectedDate);
};

// Mejorar lógica para mostrar/ocultar el placeholder
function selectDate(dateString) {
    var placeholder = document.getElementById('activities-placeholder');
    var daily = document.getElementById('daily-activities');
    if (placeholder) placeholder.style.display = 'none';
    if (daily) daily.style.display = 'block';
    if (typeof originalSelectDate === 'function') {
        originalSelectDate.call(window.app, dateString);
    }
}
window.selectDate = selectDate;

document.addEventListener('DOMContentLoaded', function() {
    var placeholder = document.getElementById('activities-placeholder');
    var daily = document.getElementById('daily-activities');
    if (placeholder) placeholder.style.display = 'block';
    if (daily) daily.style.display = 'none';
    // Si se navega y no hay día seleccionado, mostrar placeholder
    window.addEventListener('hashchange', function() {
        if (!window.selectedDate) {
            if (placeholder) placeholder.style.display = 'block';
            if (daily) daily.style.display = 'none';
        }
    });
});

// --- VISTA SEMANAL "MI SEMANA" ---


// Función para abrir modal desde calendario normal también
function openAddActivityModal(dateStr) {
    // Resetear formulario y ocultar campos PRIMERO
    document.getElementById('add-activity-form').reset();
    document.getElementById('activity-book').value = '';
    document.getElementById('description-group').style.display = 'none';
    document.getElementById('notes-group').style.display = 'none';
    
    // DESPUÉS establecer la fecha
    if (dateStr) {
        document.getElementById('activity-date').value = dateStr;
    } else {
        // Si no se proporciona fecha, usar hoy
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        document.getElementById('activity-date').value = todayStr;
    }
    
    const modal = document.getElementById('add-activity-modal');
    modal.querySelector('h3').textContent = 'Agregar Actividad';
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
}

function renderWeekView() {
    const weekCalendar = document.getElementById('week-calendar');
    const weekTitle = document.getElementById('week-title');
    if (!weekCalendar || !weekTitle) return;

    // Estado de la semana
    if (!window._weekDate) window._weekDate = new Date();
    const date = new Date(window._weekDate);
    // Calcular el lunes de la semana actual
    const currentDay = date.getDay(); // 0=Domingo, 1=Lunes...
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    // Generar los días de la semana (lunes a domingo)
    let weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDays.push(d);
    }

    // Título de la semana
    const options = { day: '2-digit', month: 'short' };
    weekTitle.innerHTML = `<span style="display:block;font-weight:600;">Semana:</span><span style="display:block;font-size:1.1em;">${weekDays[0].toLocaleDateString('es-ES', options)} - ${weekDays[6].toLocaleDateString('es-ES', options)} ${weekDays[6].getFullYear()}</span>`;

    // Obtener actividades de la semana
    const profile = getCurrentProfile && getCurrentProfile();
    let activities = [];
    if (profile) {
        activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
    }

    // Generar columnas de la semana
    let html = '';
    const dayNames = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    for (let i = 0; i < 7; i++) {
        const d = weekDays[i];
        const isToday = (new Date().toDateString() === d.toDateString());
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const dayActs = activities.filter(a => a.date === dateStr);
        const uniqueBooks = [...new Set(dayActs.map(a => a.book))];
        const bookIcons = {
            'lam': '<i class="fas fa-book" title="LIBRO LAM"></i>',
            'brainquest': '<i class="fas fa-brain" title="BRAINQUEST"></i>',
            'matific': '<i class="fas fa-calculator" title="MATIFIC"></i>',
            'duoabc': '<i class="fas fa-language" title="DUO ABC"></i>',
            'starfall': '<i class="fas fa-star" title="STARFALL"></i>'
        };
        let iconsHtml = '';
        if (uniqueBooks.length > 0) {
            iconsHtml = '<div class="calendar-day-icons">' + uniqueBooks.map(b => bookIcons[b] || '').join(' ') + '</div>';
        }
        // Determinar si es fin de semana (sábado=5, domingo=0)
        const isWeekend = i === 5 || i === 6; // sábado o domingo
        const weekendStyle = isWeekend ? 'background:#e9ecef;' : 'background:#fff;';
        
        html += `<div class="week-day-card${isToday ? ' today' : ''}" style="${weekendStyle}border-radius:14px;box-shadow:0 2px 8px rgba(59,130,246,0.06);padding:1.2rem 1rem;display:flex;flex-direction:column;align-items:center;gap:0.7rem;">
            <div style="font-weight:600;font-size:1.1em;">${dayNames[i]}</div>
            <div style="font-size:1.7em;color:#2563eb;">${d.getDate()}</div>
            <div style="font-size:0.95em;color:#888;">${d.toLocaleDateString('es-ES', {month:'short'})}</div>
            <button class="btn btn-primary" style="margin-top:0.5rem;" onclick="openWeekActivityModal('${dateStr}')"><i class="fas fa-plus"></i> Registrar Actividad</button>
            <div style="width:100%;margin-top:0.7rem;">
                ${dayActs.length === 0 ? '<div class="no-data" style="color:#b0b4ba;font-size:0.95em;">Sin actividades</div>' : dayActs.map(act => {
                    let badgeBg = '';
                    let badgeBorder = '';
                    if (act.book === 'lam') {
                        badgeBg = 'background:rgba(59,130,246,0.15);';
                        badgeBorder = 'border-left:4px solid #3b82f6;';
                    } else if (act.book === 'brainquest') {
                        badgeBg = 'background:rgba(139,92,246,0.15);';
                        badgeBorder = 'border-left:4px solid #8b5cf6;';
                    } else if (act.book === 'matific') {
                        badgeBg = 'background:rgba(239,68,68,0.15);';
                        badgeBorder = 'border-left:4px solid #ef4444;';
                    } else if (act.book === 'duoabc') {
                        badgeBg = 'background:rgba(16,185,129,0.15);';
                        badgeBorder = 'border-left:4px solid #10b981;';
                    } else if (act.book === 'starfall') {
                        badgeBg = 'background:rgba(245,158,11,0.15);';
                        badgeBorder = 'border-left:4px solid #f59e0b;';
                    } else if (act.book.startsWith('custom_')) {
                        // Aplicar colores personalizados
                        const colorMap = {
                            'blue': '#3b82f6',
                            'purple': '#8b5cf6',
                            'red': '#ef4444',
                            'green': '#10b981',
                            'orange': '#f59e0b',
                            'pink': '#ec4899',
                            'teal': '#14b8a6',
                            'indigo': '#6366f1',
                            'yellow': '#eab308',
                            'emerald': '#059669',
                            'rose': '#f43f5e',
                            'slate': '#64748b'
                        };
                        const color = colorMap[act.customActivityColor] || '#3b82f6';
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        badgeBg = `background:rgba(${r},${g},${b},0.15);`;
                        badgeBorder = `border-left:4px solid ${color};`;
                    }
                    let bookName = '';
                    if (act.book.startsWith('custom_')) {
                        bookName = act.customActivityName || 'Actividad Personalizada';
                    } else {
                        bookName = {
                            'lam': 'LIBRO LAM',
                            'brainquest': 'BRAINQUEST',
                            'matific': 'MATIFIC',
                            'duoabc': 'DUO ABC',
                            'starfall': 'STARFALL'
                        }[act.book] || '';
                    }
                    let descHtml = act.description ? `<div class='activity-desc' style='color:#374151;font-size:0.93em;margin-top:0.15em;'>📖 ${act.description}</div>` : '';
                    let notesHtml = act.notes ? `<div class='activity-notes' style='color:#2563eb;font-size:0.92em;margin-top:0.15em;'>📝 ${act.notes}</div>` : '';
                    let bookIcon = '';
                    if (act.book.startsWith('custom_')) {
                        bookIcon = `<i class="${act.customActivityIcon || 'fas fa-plus'}" title="${act.customActivityName || 'Actividad Personalizada'}"></i>`;
                    } else {
                        const bookIcons = {
                            'lam': '<i class="fas fa-book" title="LIBRO LAM"></i>',
                            'brainquest': '<i class="fas fa-brain" title="BRAINQUEST"></i>',
                            'matific': '<i class="fas fa-calculator" title="MATIFIC"></i>',
                            'duoabc': '<i class="fas fa-language" title="DUO ABC"></i>',
                            'starfall': '<i class="fas fa-star" title="STARFALL"></i>'
                        };
                        bookIcon = bookIcons[act.book] || '';
                    }
                    return `<div class="activity-badge ${act.book}" style="${badgeBg}${badgeBorder}border-radius:8px;padding:0.3em 0.7em;margin-bottom:0.3em;font-size:0.93em;display:flex;flex-direction:column;align-items:flex-start;gap:0.2em;">
                        <div style='display:flex;align-items:center;justify-content:space-between;width:100%;'>
                            <div style='display:flex;align-items:center;gap:0.5em;'>${bookIcon} <span>${bookName}</span></div>
                            <div style='display:flex;gap:0.3em;'>
                                <button class="btn btn-primary" onclick="editWeekActivity('${act.id}')" title="Editar" style="padding:0.2em 0.4em;font-size:0.75em;min-width:auto;">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" onclick="deleteWeekActivity('${act.id}')" title="Eliminar" style="padding:0.2em 0.4em;font-size:0.75em;min-width:auto;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        ${descHtml}
                        ${notesHtml}
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }
    weekCalendar.innerHTML = html;
}

// Funciones globales para la vista semanal
window.openWeekActivityModal = function(dateStr) {
    // Resetear formulario y ocultar campos PRIMERO
    document.getElementById('add-activity-form').reset();
    document.getElementById('activity-book').value = '';
    document.getElementById('description-group').style.display = 'none';
    document.getElementById('notes-group').style.display = 'none';
    
    // DESPUÉS establecer la fecha
    document.getElementById('activity-date').value = dateStr;
    
    const modal = document.getElementById('add-activity-modal');
    modal.querySelector('h3').textContent = 'Agregar Actividad';
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
};

window.editWeekActivity = function(activityId) {
    // Obtener la actividad
    const profile = getCurrentProfile();
    if (!profile) return;
    
    const activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
        showNotification('Actividad no encontrada', 'error');
        return;
    }
    
    // Llenar el formulario con los datos de la actividad
    document.getElementById('activity-book').value = activity.book;
    document.getElementById('activity-description').value = activity.description || '';
    document.getElementById('activity-notes').value = activity.notes || '';
    document.getElementById('activity-date').value = activity.date;
    
    // Mostrar campos según el tipo de actividad
    const noDescriptionBooks = ['matific', 'duoabc', 'starfall'];
    const isCustomActivity = activity.book.startsWith('custom_');
    
    // Verificar si es una actividad personalizada tipo "libro"
    let isCustomBook = false;
    if (isCustomActivity) {
        const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
        const customActivityId = activity.book.replace('custom_', '');
        const customActivity = customActivities.find(a => a.id === customActivityId);
        isCustomBook = customActivity && customActivity.category === 'libro';
    }
    
    if (noDescriptionBooks.includes(activity.book) || (isCustomActivity && !isCustomBook)) {
        document.getElementById('description-group').style.display = 'none';
    } else {
        document.getElementById('description-group').style.display = '';
    }
    document.getElementById('notes-group').style.display = '';
    
    // Guardar ID para actualización
    window._editingActivityId = activityId;
    
    // Cambiar título del modal y mostrar
    const modal = document.getElementById('add-activity-modal');
    modal.querySelector('h3').textContent = 'Editar Actividad';
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
};

window.deleteWeekActivity = function(activityId) {
    // Mostrar modal personalizado en vez de confirm()
    window._activityToDelete = activityId;
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Navegación de semana
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');
    if (prevBtn) prevBtn.onclick = function() {
        if (!window._weekDate) window._weekDate = new Date();
        window._weekDate.setDate(window._weekDate.getDate() - 7);
        renderWeekView();
    };
    if (nextBtn) nextBtn.onclick = function() {
        if (!window._weekDate) window._weekDate = new Date();
        window._weekDate.setDate(window._weekDate.getDate() + 7);
        renderWeekView();
    };
    // Renderizar al cambiar de pestaña
    document.querySelector('[data-tab="week"]').addEventListener('click', function() {
        renderWeekView();
    });
    // Renderizar si la pestaña ya está activa al cargar
    if (document.getElementById('week').classList.contains('active')) {
        renderWeekView();
    }
});

// Función para ordenar actividades por jerarquía
function sortActivitiesByHierarchy(activities) {
    const profile = getCurrentProfile();
    if (!profile) return activities;
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    
    // Definir orden de jerarquía
    const hierarchyOrder = {
        // 1. Libros (por default y personalizados)
        'lam': 1,
        'brainquest': 1,
        'custom_libro': 1,
        
        // 2. APPS (Matific, Starfall, DUO ABC, apps personalizadas)
        'matific': 2,
        'starfall': 2,
        'duoabc': 2,
        'custom_app': 2,
        
        // 3. Material Didáctico (personalizados)
        'custom_material': 3,
        
        // 4. Actividad Extracurricular (personalizados)
        'custom_extracurricular': 4
    };
    
    return activities.sort((a, b) => {
        let aOrder = 999; // Por defecto al final
        let bOrder = 999;
        
        // Determinar orden de a
        if (a.book.startsWith('custom_')) {
            const customActivityId = a.book.replace('custom_', '');
            const customActivity = customActivities.find(ca => ca.id === customActivityId);
            if (customActivity) {
                switch(customActivity.category) {
                    case 'libro':
                        aOrder = 1;
                        break;
                    case 'app':
                        aOrder = 2;
                        break;
                    case 'material didactico':
                        aOrder = 3;
                        break;
                    case 'actividad extracurricular':
                        aOrder = 4;
                        break;
                }
            }
        } else {
            aOrder = hierarchyOrder[a.book] || 999;
        }
        
        // Determinar orden de b
        if (b.book.startsWith('custom_')) {
            const customActivityId = b.book.replace('custom_', '');
            const customActivity = customActivities.find(ca => ca.id === customActivityId);
            if (customActivity) {
                switch(customActivity.category) {
                    case 'libro':
                        bOrder = 1;
                        break;
                    case 'app':
                        bOrder = 2;
                        break;
                    case 'material didactico':
                        bOrder = 3;
                        break;
                    case 'actividad extracurricular':
                        bOrder = 4;
                        break;
                }
            }
        } else {
            bOrder = hierarchyOrder[b.book] || 999;
        }
        
        // Si tienen el mismo orden jerárquico, ordenar por hora de creación
        if (aOrder === bOrder) {
            return new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date);
        }
        
        return aOrder - bOrder;
    });
}

// Función para renderizar la vista semanal "Mi semana"
function renderWeekView() {
    const weekCalendar = document.getElementById('week-calendar');
    const weekTitle = document.getElementById('week-title');
    
    if (!weekCalendar || !weekTitle) return;
    
    // Configurar fecha de la semana
    if (!window._weekDate) window._weekDate = new Date();
    const currentDate = window._weekDate;
    
    // Calcular el lunes de la semana
    const dayOfWeek = currentDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);
    
    // Generar días de la semana (lunes a domingo)
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weekDays.push(day);
    }
    
    // Actualizar título
    const options = { day: '2-digit', month: 'short' };
    const startDate = weekDays[0].toLocaleDateString('es-ES', options);
    const endDate = weekDays[6].toLocaleDateString('es-ES', options);
    const year = weekDays[6].getFullYear();
    weekTitle.textContent = `${startDate} - ${endDate} ${year}`;
    
    // Generar mapa visual del ciclo escolar
    const cycleMap = generateCycleMap(currentDate);
    weekTitle.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <span style="display:block;font-weight:600;margin-bottom:0.5rem;">Semana:</span>
            <span style="display:block;font-size:1.1em;">${startDate} - ${endDate} ${year}</span>
        </div>
        ${cycleMap}
    `;
    
    // Obtener actividades
    const profile = getCurrentProfile();
    let activities = [];
    if (profile) {
        activities = JSON.parse(localStorage.getItem(`course_progress_activities_${profile.id}`) || '[]');
    }
    
    // Generar HTML para los días de la semana
    let html = '';
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const today = new Date();
    
    weekDays.forEach((day, index) => {
        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const isToday = today.toDateString() === day.toDateString();
        const isWeekend = index >= 5; // Sábado y domingo
        
        // Obtener y ordenar actividades del día por jerarquía
        const dayActivities = activities.filter(activity => activity.date === dateStr);
        const sortedActivities = sortActivitiesByHierarchy(dayActivities);
        
        // Generar HTML para las actividades del día
        let activitiesHtml = '';
        sortedActivities.forEach(activity => {
            const activityInfo = getWeekActivityInfo(activity);
            
            activitiesHtml += `
                <div class="week-activity-card" style="border-left: 4px solid ${activityInfo.color}; background: ${activityInfo.backgroundColor};">
                    <div class="week-activity-header">
                        <i class="${activityInfo.icon}"></i>
                        <span class="week-activity-name">${activityInfo.name}</span>
                    </div>
                    ${activity.description ? `<div class="week-activity-description">${activity.description}</div>` : ''}
                    ${activity.notes ? `<div class="week-activity-notes">${activity.notes}</div>` : ''}
                    <div class="week-activity-actions">
                        <button class="btn-edit" onclick="editWeekActivity('${activity.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteWeekActivity('${activity.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Generar tarjeta del día
        html += `
            <div class="week-day-card ${isToday ? 'today' : ''}" ${isWeekend ? 'style="background:#e9ecef;"' : ''}>
                <div class="week-day-header">
                    <div class="week-day-name">${dayNames[index]}</div>
                    <div class="week-day-date">${day.getDate()}</div>
                </div>
                <button class="btn btn-primary week-register-btn" onclick="openWeekActivityModal('${dateStr}')">
                    <i class="fas fa-plus"></i> Registrar Actividad
                </button>
                <div class="week-activities-container">
                    ${activitiesHtml}
                </div>
            </div>
        `;
    });
    
    weekCalendar.innerHTML = html;
}

// Función para obtener las fechas de una semana específica del ciclo
function getWeekDates(weekNumber, cycleYear) {
    const cycleStart = new Date(cycleYear, 8, 1); // 1 de septiembre
    const weekStart = new Date(cycleStart.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    return { start: weekStart, end: weekEnd };
}

// Función para verificar si una semana toca un mes específico
function weekTouchesMonth(weekNumber, targetMonth, targetYear, cycleYear) {
    const weekDates = getWeekDates(weekNumber, cycleYear);
    const weekStartMonth = weekDates.start.getMonth();
    const weekEndMonth = weekDates.end.getMonth();
    const weekStartYear = weekDates.start.getFullYear();
    const weekEndYear = weekDates.end.getFullYear();
    
    // Verificar si la semana toca el mes objetivo
    const touchesStart = weekStartMonth === targetMonth && weekStartYear === targetYear;
    const touchesEnd = weekEndMonth === targetMonth && weekEndYear === targetYear;
    
    return touchesStart || touchesEnd;
}

// Función para generar el mapa visual del ciclo escolar
function generateCycleMap(currentDate) {
    // Determinar el año del ciclo escolar primero
    let cycleYear = currentDate.getFullYear();
    if (currentDate.getMonth() >= 8) {
        cycleYear = currentDate.getFullYear();
    } else {
        cycleYear = currentDate.getFullYear() - 1;
    }
    
    const months = [
        { name: 'SEP', month: 8, year: cycleYear },
        { name: 'OCT', month: 9, year: cycleYear },
        { name: 'NOV', month: 10, year: cycleYear },
        { name: 'DIC', month: 11, year: cycleYear },
        { name: 'ENE', month: 0, year: cycleYear + 1 },
        { name: 'FEB', month: 1, year: cycleYear + 1 },
        { name: 'MAR', month: 2, year: cycleYear + 1 },
        { name: 'ABR', month: 3, year: cycleYear + 1 },
        { name: 'MAY', month: 4, year: cycleYear + 1 },
        { name: 'JUN', month: 5, year: cycleYear + 1 },
        { name: 'JUL', month: 6, year: cycleYear + 1 },
        { name: 'AGO', month: 7, year: cycleYear + 1 }
    ];
    
    // Calcular la semana actual del ciclo escolar
    const currentWeek = getCurrentWeekOfCycle(currentDate);
    
    // Debug: mostrar información en consola
    console.log('Fecha actual:', currentDate.toDateString());
    console.log('Semana actual del ciclo:', currentWeek);
    console.log('Año del ciclo:', cycleYear);
    
    // Debug: verificar fechas de la semana actual
    const currentWeekDates = getWeekDates(currentWeek, cycleYear);
    console.log('Semana actual va del:', currentWeekDates.start.toDateString(), 'al', currentWeekDates.end.toDateString());
    
    // Debug: mostrar años de los meses
    console.log('Años de los meses:');
    months.forEach(month => {
        console.log(`${month.name}: ${month.month}/${month.year}`);
    });
    
    let mapHtml = '<div style="margin-top: 0.8rem;">';
    mapHtml += '<div style="text-align: center; font-weight: 600; margin-bottom: 0.64rem; color: #374151; font-size: 0.64rem;">MAPA DEL CICLO ESCOLAR</div>';
    
    // Layout horizontal: meses en fila con semanas debajo (20% más chico)
    mapHtml += '<div style="display: flex; gap: 0.24rem; justify-content: space-between; align-items: flex-start; width: 88%;">';
    
    months.forEach((monthInfo, monthIndex) => {
        const isCurrentMonth = currentDate.getMonth() === monthInfo.month && 
                              currentDate.getFullYear() === monthInfo.year;
        
        // Verificar si la semana actual del ciclo toca este mes
        const currentWeekTouchesThisMonth = weekTouchesMonth(currentWeek, monthInfo.month, monthInfo.year, cycleYear);
        
        // Debug: mostrar información de cada mes
        console.log(`Mes ${monthInfo.name} (${monthInfo.month}/${monthInfo.year}): isCurrentMonth=${isCurrentMonth}, touchesWeek=${currentWeekTouchesThisMonth}`);
        
        // Determinar el color del mes
        let monthColor = '#6b7280'; // Gris por defecto
        if (isCurrentMonth) {
            monthColor = '#3b82f6'; // Azul si es el mes actual
        } else if (currentWeekTouchesThisMonth) {
            monthColor = '#10b981'; // Verde si la semana actual toca este mes
        }
        
        // Recuadro alrededor de cada mes (20% más chico)
        mapHtml += `<div style="display: flex; flex-direction: column; align-items: center; min-width: 0; flex: 1; background: #ffffff; border: 1.6px solid ${monthColor}; border-radius: 6.4px; padding: 0.48rem 0.24rem; box-shadow: 0 1.6px 3.2px rgba(0,0,0,0.1);">`;
        
        // Nombre del mes (horizontal) con color correspondiente (20% más chico)
        mapHtml += `<div style="font-weight: 700; color: ${monthColor}; font-size: 0.64rem; cursor: pointer; padding: 0.16rem 0.32rem; border-radius: 4.8px; transition: background 0.2s; text-align: center;" onclick="navigateToMonth(${monthInfo.month}, ${monthInfo.year})" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">${monthInfo.name}</div>`;
        
        mapHtml += `</div>`;
    });
    
    mapHtml += '</div></div>';
    return mapHtml;
}

// Función para calcular la semana actual del ciclo escolar
function getCurrentWeekOfCycle(currentDate) {
    // Ciclo escolar: septiembre a agosto
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Determinar el año del ciclo escolar
    let cycleYear = currentYear;
    if (currentMonth >= 8) { // Septiembre en adelante
        cycleYear = currentYear;
    } else { // Enero a agosto
        cycleYear = currentYear - 1;
    }
    
    // Fecha de inicio del ciclo (1 de septiembre)
    const cycleStart = new Date(cycleYear, 8, 1); // 8 = septiembre (0-indexado)
    
    // Calcular días transcurridos desde el inicio del ciclo
    const timeDiff = currentDate.getTime() - cycleStart.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Calcular semana (redondear hacia arriba)
    const weekNumber = Math.ceil((daysDiff + 1) / 7);
    
    // Asegurar que esté entre 1 y 48 (12 meses x 4 semanas)
    return Math.max(1, Math.min(48, weekNumber));
}

// Función para obtener el número de semanas en un mes
function getWeeksInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calcular días en el mes
    const daysInMonth = lastDay.getDate();
    
    // Calcular en qué día de la semana empieza el mes (0=domingo, 1=lunes, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calcular cuántas semanas completas hay
    // Ajustar para que el lunes sea el primer día de la semana
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convertir domingo=0 a domingo=6
    
    // Calcular semanas necesarias
    const weeksNeeded = Math.ceil((adjustedFirstDay + daysInMonth) / 7);
    
    return Math.max(4, Math.min(5, weeksNeeded)); // Entre 4 y 5 semanas por mes
}

// Función para navegar a un mes específico
function navigateToMonth(month, year) {
    const targetDate = new Date(year, month, 1);
    window._weekDate = targetDate;
    renderWeekView();
}

// Función para navegar a una semana específica
function navigateToWeek(weekNumber) {
    // Calcular la fecha de inicio del ciclo escolar
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    let cycleYear = currentYear;
    if (currentMonth >= 8) { // Septiembre en adelante
        cycleYear = currentYear;
    } else { // Enero a julio
        cycleYear = currentYear - 1;
    }
    
    const cycleStart = new Date(cycleYear, 8, 1); // 1 de septiembre
    const targetDate = new Date(cycleStart);
    targetDate.setDate(cycleStart.getDate() + (weekNumber - 1) * 7);
    
    window._weekDate = targetDate;
    renderWeekView();
}

// Función auxiliar para obtener información de actividad en vista semanal
function getWeekActivityInfo(activity) {
    if (activity.book.startsWith('custom_')) {
        const profile = getCurrentProfile();
        if (profile) {
            const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
            const customActivityId = activity.book.replace('custom_', '');
            const customActivity = customActivities.find(a => a.id === customActivityId);
            
            if (customActivity) {
                const colorMap = {
                    'blue': '#3b82f6', 'purple': '#8b5cf6', 'red': '#ef4444', 'green': '#10b981',
                    'orange': '#f59e0b', 'pink': '#ec4899', 'teal': '#14b8a6', 'indigo': '#6366f1',
                    'yellow': '#eab308', 'emerald': '#059669', 'rose': '#f43f5e', 'slate': '#64748b'
                };
                const color = colorMap[customActivity.color] || '#3b82f6';
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                return {
                    name: customActivity.name,
                    icon: customActivity.icon || 'fas fa-plus',
                    color: color,
                    backgroundColor: `rgba(${r},${g},${b},0.15)`
                };
            }
        }
        return {
            name: 'Actividad Personalizada',
            icon: 'fas fa-plus',
            color: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.15)'
        };
    }
    
    // Actividades por defecto
    const defaultActivities = {
        'lam': { name: 'LIBRO LAM', icon: 'fas fa-book', color: '#3b82f6' },
        'brainquest': { name: 'BRAINQUEST', icon: 'fas fa-brain', color: '#8b5cf6' },
        'matific': { name: 'MATIFIC', icon: 'fas fa-calculator', color: '#ef4444' },
        'duoabc': { name: 'DUO ABC', icon: 'fas fa-language', color: '#10b981' },
        'starfall': { name: 'STARFALL', icon: 'fas fa-star', color: '#f59e0b' }
    };
    
    const activityInfo = defaultActivities[activity.book];
    if (activityInfo) {
        const r = parseInt(activityInfo.color.slice(1, 3), 16);
        const g = parseInt(activityInfo.color.slice(3, 5), 16);
        const b = parseInt(activityInfo.color.slice(5, 7), 16);
        
        return {
            ...activityInfo,
            backgroundColor: `rgba(${r},${g},${b},0.15)`
        };
    }
    
    return {
        name: activity.book.toUpperCase(),
        icon: 'fas fa-book',
        color: '#64748b',
        backgroundColor: 'rgba(100,116,139,0.15)'
    };
}

// --- FUNCIONES PARA AGREGAR NUEVAS ACTIVIDADES ---
function openAddNewActivityModal() {
    const modal = document.getElementById('add-new-activity-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddNewActivityModal() {
    const modal = document.getElementById('add-new-activity-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        document.body.style.overflow = '';
        // Resetear formulario
        document.getElementById('add-new-activity-form').reset();
        // Resetear selecciones visuales
        document.querySelectorAll('.color-option').forEach(option => {
            option.style.border = '2px solid transparent';
            option.style.transform = 'scale(1)';
        });
        document.querySelectorAll('.icon-option').forEach(option => {
            option.style.border = '2px solid transparent';
            option.style.background = '#f8f9fa';
        });
        // Resetear valores por defecto
        document.getElementById('new-activity-color').value = 'blue';
        document.getElementById('new-activity-icon').value = 'fas fa-book-open';
        // Resetear título del modal
        modal.querySelector('h3').textContent = 'Agregar Nueva Actividad';
        // Limpiar variable de edición
        window._editingCustomActivityId = null;
    }
}

function addNewActivity() {
    const activityType = document.getElementById('new-activity-type').value;
    const activityName = document.getElementById('new-activity-name').value;
    const activityDescription = document.getElementById('new-activity-description').value;
    const activityColor = document.getElementById('new-activity-color').value;
    const activityIcon = document.getElementById('new-activity-icon').value;
    
    if (!activityType || !activityName) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    // Guardar en localStorage
    const profile = getCurrentProfile();
    if (!profile) {
        showNotification('No se encontró el perfil actual', 'error');
        return;
    }
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    
    // Verificar si estamos editando o creando
    if (window._editingCustomActivityId) {
        // Editar actividad existente
        const activityIndex = customActivities.findIndex(a => a.id === window._editingCustomActivityId);
        if (activityIndex !== -1) {
            customActivities[activityIndex] = {
                ...customActivities[activityIndex],
                category: activityType,
                name: activityName,
                description: activityDescription,
                color: activityColor,
                icon: activityIcon
            };
            localStorage.setItem(`course_progress_custom_activities_${profile.id}`, JSON.stringify(customActivities));
            showNotification('Actividad personalizada actualizada correctamente', 'success');
        }
        window._editingCustomActivityId = null;
    } else {
        // Crear nueva actividad personalizada
        const newActivity = {
            id: Date.now().toString(),
            type: 'custom',
            category: activityType,
            name: activityName,
            description: activityDescription,
            color: activityColor,
            icon: activityIcon,
            dateCreated: new Date().toISOString().split('T')[0]
        };
        
        customActivities.push(newActivity);
        localStorage.setItem(`course_progress_custom_activities_${profile.id}`, JSON.stringify(customActivities));
        showNotification('Nueva actividad agregada correctamente', 'success');
    }
    
    // Cerrar modal y actualizar vista
    closeAddNewActivityModal();
    renderCustomActivities();
    
    // Actualizar el select de actividades
    loadCustomActivitiesInSelect();
}

// Función para renderizar actividades personalizadas
function renderCustomActivities() {
    const profile = getCurrentProfile();
    if (!profile) return;
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    const booksGrid = document.querySelector('.books-grid');
    
    if (!booksGrid) return;
    
    // Limpiar actividades personalizadas existentes SIEMPRE
    const existingCustom = booksGrid.querySelectorAll('.custom-activity-card');
    existingCustom.forEach(card => card.remove());
    
    // Si no hay actividades personalizadas, terminar aquí (después de limpiar)
    if (customActivities.length === 0) return;
    
    // Agregar nuevas actividades personalizadas
    customActivities.forEach(activity => {
        const colorMap = {
            'blue': '#3b82f6',
            'purple': '#8b5cf6',
            'red': '#ef4444',
            'green': '#10b981',
            'orange': '#f59e0b',
            'pink': '#ec4899',
            'teal': '#14b8a6',
            'indigo': '#6366f1',
            'yellow': '#eab308',
            'emerald': '#059669',
            'rose': '#f43f5e',
            'slate': '#64748b'
        };
        
        let activityCard;
        
        if (activity.category === 'libro' || activity.category === 'app') {
            // Crear enlace para actividades tipo libro y app
            activityCard = document.createElement('a');
            activityCard.href = `libro.html?book=custom_${activity.id}`;
            activityCard.className = 'book-card custom-activity-card';
            activityCard.style.borderLeft = `4px solid ${colorMap[activity.color] || '#3b82f6'}`;
            activityCard.style.textDecoration = 'none';
            activityCard.style.color = 'inherit';
            activityCard.innerHTML = `
                <div class="book-icon">
                    <i class="${activity.icon || 'fas fa-plus'}"></i>
                </div>
                <h3>${activity.name}</h3>
                <p>${activity.description || 'Actividad personalizada'}</p>
                <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" onclick="event.preventDefault(); editCustomActivity('${activity.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="event.preventDefault(); deleteCustomActivity('${activity.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
        } else {
            // Crear div normal para otras actividades
            activityCard = document.createElement('div');
            activityCard.className = 'book-card custom-activity-card';
            activityCard.style.borderLeft = `4px solid ${colorMap[activity.color] || '#3b82f6'}`;
            activityCard.innerHTML = `
                <div class="book-icon">
                    <i class="${activity.icon || 'fas fa-plus'}"></i>
                </div>
                <h3>${activity.name}</h3>
                <p>${activity.description || 'Actividad personalizada'}</p>
                <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" onclick="editCustomActivity('${activity.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteCustomActivity('${activity.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
        }
        
        booksGrid.appendChild(activityCard);
    });
}

// Event listener para el formulario de nueva actividad
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-new-activity-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewActivity();
        });
    }
    
    // Event listeners para selección de colores
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-option') || e.target.closest('.color-option')) {
            const colorOption = e.target.classList.contains('color-option') ? e.target : e.target.closest('.color-option');
            
            // Remover selección anterior
            document.querySelectorAll('.color-option').forEach(option => {
                option.style.border = '2px solid transparent';
                option.style.transform = 'scale(1)';
            });
            
            // Seleccionar nuevo color
            colorOption.style.border = '2px solid #374151';
            colorOption.style.transform = 'scale(1.1)';
            
            // Actualizar input hidden
            const color = colorOption.getAttribute('data-color');
            document.getElementById('new-activity-color').value = color;
        }
        
        // Event listeners para selección de iconos
        if (e.target.classList.contains('icon-option') || e.target.closest('.icon-option')) {
            const iconOption = e.target.classList.contains('icon-option') ? e.target : e.target.closest('.icon-option');
            
            // Remover selección anterior
            document.querySelectorAll('.icon-option').forEach(option => {
                option.style.border = '2px solid transparent';
                option.style.background = '#f8f9fa';
            });
            
            // Seleccionar nuevo icono
            iconOption.style.border = '2px solid #3b82f6';
            iconOption.style.background = '#eff6ff';
            
            // Actualizar input hidden
            const icon = iconOption.getAttribute('data-icon');
            document.getElementById('new-activity-icon').value = icon;
        }
    });
    
    // Renderizar actividades personalizadas al cargar
    renderCustomActivities();
    
    // Cargar actividades personalizadas en el select
    loadCustomActivitiesInSelect();
    
    // Event listener para el botón de confirmación de eliminación de actividades personalizadas
    const confirmDeleteCustomBtn = document.getElementById('confirm-delete-custom-activity-btn');
    if (confirmDeleteCustomBtn) {
        confirmDeleteCustomBtn.addEventListener('click', () => {
            const activityId = window._customActivityToDelete;
            if (!activityId) return;
            
            const profile = getCurrentProfile();
            if (!profile) return;
            
            const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
            const updatedActivities = customActivities.filter(a => a.id !== activityId);
            localStorage.setItem(`course_progress_custom_activities_${profile.id}`, JSON.stringify(updatedActivities));
            
            // Actualizar la vista
            renderCustomActivities();
            
            // Actualizar el select de actividades
            loadCustomActivitiesInSelect();
            
            // Mostrar notificación
            showNotification('Actividad personalizada eliminada correctamente', 'success');
            
            // Cerrar modal
            closeDeleteCustomActivityModal();
        });
    }
});

// Función para cargar actividades personalizadas en el select
function loadCustomActivitiesInSelect() {
    const profile = getCurrentProfile();
    if (!profile) return;
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    const customGroup = document.getElementById('custom-activities-group');
    
    if (!customGroup) return;
    
    // Limpiar opciones existentes
    customGroup.innerHTML = '';
    
    // Agregar actividades personalizadas
    customActivities.forEach(activity => {
        const option = document.createElement('option');
        option.value = `custom_${activity.id}`;
        option.textContent = activity.name;
        option.setAttribute('data-custom-activity', JSON.stringify(activity));
        customGroup.appendChild(option);
    });
}

// Funciones para editar y eliminar actividades personalizadas
function editCustomActivity(activityId) {
    const profile = getCurrentProfile();
    if (!profile) return;
    
    const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
    const activity = customActivities.find(a => a.id === activityId);
    
    if (!activity) {
        showNotification('Actividad no encontrada', 'error');
        return;
    }
    
    // Llenar el formulario con los datos de la actividad
    document.getElementById('new-activity-type').value = activity.category;
    document.getElementById('new-activity-name').value = activity.name;
    document.getElementById('new-activity-description').value = activity.description || '';
    document.getElementById('new-activity-color').value = activity.color;
    document.getElementById('new-activity-icon').value = activity.icon;
    
    // Seleccionar visualmente el color
    document.querySelectorAll('.color-option').forEach(option => {
        option.style.border = '2px solid transparent';
        option.style.transform = 'scale(1)';
    });
    const colorOption = document.querySelector(`[data-color="${activity.color}"]`);
    if (colorOption) {
        colorOption.style.border = '2px solid #374151';
        colorOption.style.transform = 'scale(1.1)';
    }
    
    // Seleccionar visualmente el icono
    document.querySelectorAll('.icon-option').forEach(option => {
        option.style.border = '2px solid transparent';
        option.style.background = '#f8f9fa';
    });
    const iconOption = document.querySelector(`[data-icon="${activity.icon}"]`);
    if (iconOption) {
        iconOption.style.border = '2px solid #3b82f6';
        iconOption.style.background = '#eff6ff';
    }
    
    // Guardar ID para actualización
    window._editingCustomActivityId = activityId;
    
    // Cambiar título del modal y mostrar
    const modal = document.getElementById('add-new-activity-modal');
    modal.querySelector('h3').textContent = 'Editar Actividad';
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
}

function deleteCustomActivity(activityId) {
    // Mostrar modal personalizado en vez de confirm()
    window._customActivityToDelete = activityId;
    const modal = document.getElementById('delete-custom-activity-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }
}

function closeDeleteCustomActivityModal() {
    const modal = document.getElementById('delete-custom-activity-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        document.body.style.overflow = '';
        window._customActivityToDelete = null;
    }
}

// Event listener para el botón de confirmación de eliminación de actividades personalizadas
if (typeof window._deleteCustomActivityModalSetup === 'undefined') {
    window._deleteCustomActivityModalSetup = true;
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('confirm-delete-custom-activity-btn');
        if (btn) {
            btn.onclick = function() {
                const activityId = window._customActivityToDelete;
                if (!activityId) return;
                
                const profile = getCurrentProfile();
                if (!profile) return;
                
                // Eliminar la actividad personalizada
                const customActivities = JSON.parse(localStorage.getItem(`course_progress_custom_activities_${profile.id}`) || '[]');
                const updatedCustomActivities = customActivities.filter(a => a.id !== activityId);
                localStorage.setItem(`course_progress_custom_activities_${profile.id}`, JSON.stringify(updatedCustomActivities));
                
                // Actualizar la vista
                renderCustomActivities();
                
                // Actualizar el select de actividades
                loadCustomActivitiesInSelect();
                
                // Mostrar notificación
                showNotification('Actividad personalizada eliminada correctamente', 'success');
                
                // Cerrar modal
                closeDeleteCustomActivityModal();
            };
        }
    });
}
