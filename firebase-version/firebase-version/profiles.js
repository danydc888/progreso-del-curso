// Gestión de Perfiles de Alumnos
class ProfileManager {
    constructor() {
        this.profiles = this.loadProfiles();
        this.selectedAvatar = null;
        this.editingProfileId = null;
        this.deletingProfileId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderProfiles();
    }

    // Event Listeners
    setupEventListeners() {
        // Add profile button
        document.getElementById('add-profile-card').addEventListener('click', () => {
            this.openModal('create-profile-modal');
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

        // Avatar selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.avatar-option')) {
                const option = e.target.closest('.avatar-option');
                this.selectAvatar(option);
            }
        });

        // Forms
        document.getElementById('create-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createProfile();
        });

        document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Delete confirmation
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.deleteProfile();
        });
    }

    // Profile Management
    createProfile() {
        const name = document.getElementById('student-name').value.trim();
        const grade = document.getElementById('student-grade').value.trim();
        const cycle = document.getElementById('student-cycle').value.trim();

        if (!name || !this.selectedAvatar || !grade || !cycle) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        const profile = {
            id: Date.now().toString(),
            name,
            avatar: this.selectedAvatar,
            grade,
            cycle,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
        };

        this.profiles.push(profile);
        this.saveProfiles();
        
        this.closeModal(document.getElementById('create-profile-modal'));
        this.renderProfiles();
        this.resetForm();
    }

    updateProfile() {
        const id = document.getElementById('edit-profile-id').value;
        const name = document.getElementById('edit-student-name').value.trim();
        const grade = document.getElementById('edit-student-grade').value.trim();
        const cycle = document.getElementById('edit-student-cycle').value.trim();

        if (!name || !this.selectedAvatar || !grade || !cycle) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        const profileIndex = this.profiles.findIndex(p => p.id === id);
        if (profileIndex !== -1) {
            this.profiles[profileIndex] = {
                ...this.profiles[profileIndex],
                name,
                avatar: this.selectedAvatar,
                grade,
                cycle,
                updatedAt: new Date().toISOString()
            };

            this.saveProfiles();
            this.closeModal(document.getElementById('edit-profile-modal'));
            this.renderProfiles();
            this.resetForm();
        }
    }

    deleteProfile() {
        if (this.deletingProfileId) {
            this.profiles = this.profiles.filter(p => p.id !== this.deletingProfileId);
            this.saveProfiles();
            this.closeModal(document.getElementById('delete-profile-modal'));
            this.renderProfiles();
            this.deletingProfileId = null;
        }
    }

    editProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return;

        this.editingProfileId = profileId;
        this.selectedAvatar = profile.avatar;

        // Populate form
        document.getElementById('edit-profile-id').value = profile.id;
        document.getElementById('edit-student-name').value = profile.name;
        document.getElementById('edit-student-grade').value = profile.grade || '';
        document.getElementById('edit-student-cycle').value = profile.cycle || '';

        // Update avatar selection
        this.updateAvatarSelection('edit-avatar-selection', profile.avatar);

        this.openModal('edit-profile-modal');
    }

    confirmDeleteProfile(profileId) {
        this.deletingProfileId = profileId;
        this.openModal('delete-profile-modal');
    }

    selectProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return;

        // Update last accessed time
        profile.lastAccessed = new Date().toISOString();
        this.saveProfiles();

        // Store current profile in session storage
        sessionStorage.setItem('currentProfile', JSON.stringify(profile));

        // Redirect to main app
        window.location.href = 'index.html';
    }

    // UI Management
    renderProfiles() {
        const container = document.getElementById('profiles-grid');
        
        if (this.profiles.length === 0) {
            container.innerHTML = `
                <div class="no-profiles">
                    <i class="fas fa-user-plus"></i>
                    <h3>No hay perfiles creados</h3>
                    <p>Crea el primer perfil para comenzar</p>
                </div>
            `;
            return;
        }

        // Sort profiles by last accessed (most recent first)
        const sortedProfiles = [...this.profiles].sort((a, b) => 
            new Date(b.lastAccessed) - new Date(a.lastAccessed)
        );

        const avatarIcons = {
            'boy1': '👦',
            'girl1': '👧',
            'cat': '🐱',
            'robot': '🤖',
            'alien': '👽',
            'sunglasses': '😎',
            'lion': '🦁',
            'bee': '🐝',
            'dog': '🐶',
            'sparkles': '✨',
            'unicorn': '🦄',
            'chick': '🐥'
        };

        container.innerHTML = sortedProfiles.map(profile => {
            // const stats = this.getProfileStats(profile.id); // Ya no se usa
            return `
                <div class="profile-card" onclick="profileManager.selectProfile('${profile.id}')">
                    <div class="profile-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); profileManager.editProfile('${profile.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="event.stopPropagation(); profileManager.confirmDeleteProfile('${profile.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="profile-avatar">
                        <div class="avatar-preview ${profile.avatar}">${avatarIcons[profile.avatar] || '👤'}</div>
                    </div>
                    <div class="profile-name">${profile.name}</div>
                    <div class="profile-grade">${profile.grade || 'Sin grado'}</div>
                    <div class="profile-cycle">${profile.cycle || 'Sin ciclo'}</div>
                </div>
            `;
        }).join('');
    }

    selectAvatar(optionElement) {
        // Remove previous selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked option
        optionElement.classList.add('selected');
        this.selectedAvatar = optionElement.dataset.avatar;
    }

    updateAvatarSelection(containerId, selectedAvatar) {
        const container = document.getElementById(containerId);
        const avatars = ['boy1', 'girl1', 'cat', 'robot', 'alien', 'sunglasses', 'lion', 'bee', 'dog', 'sparkles', 'unicorn', 'chick'];
        const avatarIcons = {
            'boy1': '👦',
            'girl1': '👧',
            'cat': '🐱',
            'robot': '🤖',
            'alien': '👽',
            'sunglasses': '😎',
            'lion': '🦁',
            'bee': '🐝',
            'dog': '🐶',
            'sparkles': '✨',
            'unicorn': '🦄',
            'chick': '🐥'
        };
        
        container.innerHTML = avatars.map(avatar => `
            <div class="avatar-option ${avatar === selectedAvatar ? 'selected' : ''}" data-avatar="${avatar}">
                <div class="avatar-preview ${avatar}">${avatarIcons[avatar]}</div>
            </div>
        `).join('');

        this.selectedAvatar = selectedAvatar;
    }

    getGradeText(grade) {
        return grade || 'Sin grado';
    }

    getProfileStats(profileId) {
        // Load profile data from localStorage
        const subjects = JSON.parse(localStorage.getItem(`course_progress_subjects_${profileId}`) || '[]');
        const grades = JSON.parse(localStorage.getItem(`course_progress_grades_${profileId}`) || '[]');
        
        const average = grades.length > 0 
            ? (grades.reduce((sum, g) => sum + g.value, 0) / grades.length).toFixed(1)
            : '0.0';

        return {
            subjects: subjects.length,
            average: average
        };
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Reset form and avatar selection for create modal
        if (modalId === 'create-profile-modal') {
            this.resetForm();
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        // Reset create form
        document.getElementById('create-profile-form').reset();
        document.getElementById('edit-profile-form').reset();
        
        // Reset avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        this.selectedAvatar = null;
    }

    // Data Management
    saveProfiles() {
        localStorage.setItem('course_progress_profiles', JSON.stringify(this.profiles));
    }

    loadProfiles() {
        const profiles = localStorage.getItem('course_progress_profiles');
        return profiles ? JSON.parse(profiles) : [];
    }

    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Check if user is coming from main app and redirect if no profile selected
document.addEventListener('DOMContentLoaded', () => {
    const currentProfile = sessionStorage.getItem('currentProfile');
    if (currentProfile && window.location.pathname.includes('index.html')) {
        // User has a profile selected, let them continue
        return;
    }
    
    // If no profile selected and trying to access main app, redirect to profiles
    if (window.location.pathname.includes('index.html') && !currentProfile) {
        window.location.href = 'profiles.html';
    }
});
