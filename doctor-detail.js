
const API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000',
    endpoints: {
        doctorDetail: '/api/doctors/doctors/{id}/',
        doctors: '/api/doctors/doctors/',
    },
    timeout: 15000,
    retry: {
        enabled: true,
        maxRetries: 3,
        delayMs: 2000
    }
};


function getFullImagePath(relativePath) {
    if (!relativePath) return 'https://via.placeholder.com/250?text=Doctor';
    if (relativePath.startsWith('http')) return relativePath;
    if (relativePath.startsWith('/')) return API_CONFIG.baseURL + relativePath;
    return relativePath;
}

function getDoctorIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}


function toggleMenu() {
    const hamIcon = document.querySelector('.ham-icon');
    const navMenu = document.querySelector('.nav-menu');

    if (hamIcon && navMenu) {
        hamIcon.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }
}

// Close menu when clicking outside or on links
function setupMobileMenu() {
    const hamIcon = document.querySelector('.ham-icon');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamIcon || !navMenu) return;

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !hamIcon.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu when clicking a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

function closeMenu() {
    const hamIcon = document.querySelector('.ham-icon');
    const navMenu = document.querySelector('.nav-menu');

    if (hamIcon && navMenu) {
        hamIcon.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}


class APIService {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }

    getCacheKey(url) {
        return url;
    }

    getFromCache(url) {
        const cacheKey = this.getCacheKey(url);
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`✓ Using cached data for: ${url}`);
            return cached.data;
        }

        return null;
    }

    setCache(url, data) {
        const cacheKey = this.getCacheKey(url);
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        console.log(`✓ Cached data for: ${url}`);
    }

    async fetchWithRetry(url, options = {}, retryCount = 0) {
        if (!options.method || options.method === 'GET') {
            const cachedData = this.getFromCache(url);
            if (cachedData) {
                return cachedData;
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            console.log(`Fetching: ${url}`);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter
                    ? parseInt(retryAfter) * 1000
                    : this.config.retry.delayMs * Math.pow(2, retryCount);

                console.warn(`⚠️ Rate limited (429). Waiting ${waitTime}ms before retry...`);

                if (retryCount < this.config.retry.maxRetries) {
                    await this.delay(waitTime);
                    return this.fetchWithRetry(url, options, retryCount + 1);
                }

                throw new Error(`HTTP error! Status: 429 - Rate limit exceeded after ${retryCount} retries`);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✓ Response from ${url}:`, data);

            this.setCache(url, data);

            return data;
        } catch (error) {
            if (this.config.retry.enabled &&
                retryCount < this.config.retry.maxRetries &&
                error.name !== 'AbortError' &&
                !error.message.includes('429')) {

                const waitTime = this.config.retry.delayMs * Math.pow(2, retryCount);
                console.warn(`⚠️ Retry attempt ${retryCount + 1}/${this.config.retry.maxRetries} for ${url} (waiting ${waitTime}ms)`);

                await this.delay(waitTime);
                return this.fetchWithRetry(url, options, retryCount + 1);
            }

            console.error(`❌ Failed to fetch ${url}:`, error);
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchDoctorDetail(id) {
        try {
            const endpoint = this.config.endpoints.doctorDetail.replace('{id}', id);
            const url = `${this.config.baseURL}${endpoint}`;
            return await this.fetchWithRetry(url);
        } catch (error) {
            console.error(`❌ Error fetching doctor details for ID ${id}:`, error);
            throw error;
        }
    }

    async fetchAllDoctors() {
        try {
            const url = `${this.config.baseURL}${this.config.endpoints.doctors}`;
            const data = await this.fetchWithRetry(url);

            if (Array.isArray(data)) {
                return data;
            } else if (data && Array.isArray(data.results)) {
                return data.results;
            }
            return [];
        } catch (error) {
            console.error('❌ Error fetching doctors:', error);
            return [];
        }
    }
}


class DoctorProfilePage {
    constructor() {
        this.apiService = new APIService(API_CONFIG);
        this.doctorData = null;
        this.doctorId = getDoctorIdFromURL();

        // DOM Elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorOverlay = document.getElementById('errorOverlay');
        this.profileHero = document.getElementById('profileHero');
        this.breadcrumbName = document.getElementById('breadcrumbName');
    }

    async init() {
        if (!this.doctorId) {
            this.showError('No doctor ID provided. Please select a doctor from the doctors list.');
            return;
        }

        try {
            this.showLoading();

            // Setup mobile menu first
            setupMobileMenu();

            // Fetch doctor details
            console.log(`Loading doctor profile for ID: ${this.doctorId}`);
            this.doctorData = await this.apiService.fetchDoctorDetail(this.doctorId);
            console.log('✓ Doctor data loaded:', this.doctorData);

            // Render all sections
            this.renderProfileHero();
            this.renderOverviewTab();
            this.renderExperienceTab();
            this.renderAchievementsTab();
            this.renderAvailabilityTab();

            // Setup tab switching
            this.setupTabSwitching();

            // Load related doctors
            setTimeout(async () => {
                try {
                    await this.renderRelatedDoctors();
                } catch (error) {
                    console.error('Failed to load related doctors (non-critical):', error);
                }
            }, 1000);

            this.hideLoading();
        } catch (error) {
            console.error('❌ Failed to load doctor profile:', error);

            let errorMessage = 'Failed to load doctor profile. Please try again.';
            if (error.message.includes('429')) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Doctor not found. Please check the URL and try again.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error. Please try again later.';
            }

            this.showError(errorMessage);
        }
    }

    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    showError(message) {
        this.hideLoading();
        if (this.errorOverlay) {
            this.errorOverlay.style.display = 'flex';
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    }

    renderProfileHero() {
        const doctor = this.doctorData;
        const fullName = `${doctor.title || ''} ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();

        // Update breadcrumb
        if (this.breadcrumbName) {
            this.breadcrumbName.textContent = fullName;
        }

        // Update page title
        document.title = `${fullName} - Gods Life Health Care`;

        const imageUrl = getFullImagePath(doctor.profile_image_url || doctor.profile_image);
        const specialtyName = doctor.specialty?.name || doctor.specialty_name || 'Medical Specialist';
        const hospitalName = doctor.hospital?.name || doctor.hospital_name || 'Healthcare Institution';
        const cityName = doctor.hospital?.city_name || doctor.city_name || '';
        const countryName = doctor.hospital?.country_name || doctor.country_name || '';

        const location = [hospitalName, cityName, countryName].filter(Boolean).join(', ');

        const languages = doctor.languages_list || doctor.languages || 'English';
        const rating = parseFloat(doctor.rating) || 0;
        const totalReviews = doctor.total_reviews || 0;
        const totalPatients = doctor.total_patients || 0;
        const successRate = parseFloat(doctor.success_rate) || 0;
        const yearsExp = doctor.years_of_experience || 0;
        const consultationFee = doctor.consultation_fee || 'Contact for pricing';

        // Escape quotes for onclick attributes
        const escapedName = fullName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const escapedSpecialty = specialtyName.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const heroHTML = `
        <div class="doctor-image-section">
            <img src="${imageUrl}" alt="${fullName}" class="doctor-profile-image" 
                 onerror="this.src='https://via.placeholder.com/250?text=Doctor'">
            <div class="verification-badges">
                ${doctor.is_verified ? '<div class="badge verified"><i class="fas fa-check-circle"></i> Verified</div>' : ''}
                ${doctor.is_featured ? '<div class="badge featured"><i class="fas fa-star"></i> Featured</div>' : ''}
            </div>
        </div>

        <div class="doctor-info-section">
            <h1>${fullName}</h1>
            <p class="doctor-specialty"><i class="fas fa-stethoscope"></i> ${specialtyName}</p>
            <p class="doctor-hospital"><i class="fas fa-hospital"></i> ${location}</p>
            
            <div class="doctor-meta">
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <div>
                        <div class="meta-value">${rating.toFixed(1)}</div>
                        <div class="meta-label">${totalReviews} Reviews</div>
                    </div>
                </div>
                <div class="meta-item">
                    <i class="fas fa-award"></i>
                    <div>
                        <div class="meta-value">${yearsExp}+</div>
                        <div class="meta-label">Years Experience</div>
                    </div>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <div>
                        <div class="meta-value">${totalPatients}+</div>
                        <div class="meta-label">Patients Treated</div>
                    </div>
                </div>
            </div>

            <p class="doctor-languages">
                <i class="fas fa-language"></i> <strong>Languages:</strong> ${languages}
            </p>
        </div>

        <div class="quick-stats">
            <h3>Quick Stats</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${successRate}%</span>
                    <span class="stat-label">Success Rate</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${rating.toFixed(1)}/5</span>
                    <span class="stat-label">Patient Rating</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${yearsExp}+</span>
                    <span class="stat-label">Years of Practice</span>
                </div>
            </div>

            <div class="availability-status">
                <div class="status-indicator ${doctor.is_available ? 'available' : 'unavailable'}">
                    <i class="fas fa-circle"></i>
                    ${doctor.is_available ? 'Available for Consultation' : 'Currently Unavailable'}
                </div>
                <div class="consultation-fee">
                    Consultation Fee: <span class="fee-amount">$${consultationFee}</span>
                </div>
            </div>

            <div class="cta-buttons">
                <button class="cta-btn primary" onclick="bookDoctor('${escapedName}', '${escapedSpecialty}')">
                    <i class="fas fa-calendar-check"></i>
                    Book Appointment
                </button>
                <button class="cta-btn secondary" onclick="window.location.href='tel:${doctor.phone || ''}'">
                    <i class="fas fa-phone"></i>
                    Contact
                </button>
            </div>
        </div>
    `;

        if (this.profileHero) {
            this.profileHero.innerHTML = heroHTML;
        }
    }

    renderOverviewTab() {
        const doctor = this.doctorData;
        const bio = doctor.bio || 'Dedicated medical professional committed to providing excellent patient care.';
        const specialty = doctor.specialty || {};
        const subSpecialties = doctor.sub_specialties || doctor.specialties_list || '';

        const overviewHTML = `
            <div class="bio-section">
                <h3><i class="fas fa-user-md"></i> About ${doctor.first_name || 'Doctor'}</h3>
                <p>${bio}</p>
            </div>

            <div class="specialty-details">
                <h3><i class="fas fa-stethoscope"></i> Specializations</h3>
                <div class="specialty-grid">
                    <div class="specialty-card">
                        <i class="fas fa-heartbeat"></i>
                        <h4>${specialty.name || 'Primary Specialty'}</h4>
                        <p>${specialty.description || 'Specialized medical care'}</p>
                    </div>
                    ${subSpecialties ? `
                    <div class="specialty-card">
                        <i class="fas fa-notes-medical"></i>
                        <h4>Sub-Specialties</h4>
                        <p>${subSpecialties}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        const overviewContent = document.getElementById('overviewContent');
        if (overviewContent) {
            overviewContent.innerHTML = overviewHTML;
        }
    }

    renderExperienceTab() {
        const doctor = this.doctorData;
        const qualifications = doctor.qualifications || 'Medical Degree from accredited institution';
        const yearsExp = doctor.years_of_experience || 0;

        const experienceHTML = `
            <div class="experience-grid">
                <div class="experience-card">
                    <h3><i class="fas fa-graduation-cap"></i> Qualifications & Education</h3>
                    <p>${qualifications}</p>
                </div>

                <div class="experience-card">
                    <h3><i class="fas fa-briefcase"></i> Professional Experience</h3>
                    <p><strong>${yearsExp}+ years</strong> of dedicated medical practice</p>
                    ${doctor.hospital ? `
                    <p>Currently practicing at <strong>${doctor.hospital.name || doctor.hospital_name}</strong></p>
                    ` : ''}
                </div>

                ${doctor.research_publications ? `
                <div class="experience-card">
                    <h3><i class="fas fa-book"></i> Research & Publications</h3>
                    <p>${doctor.research_publications}</p>
                </div>
                ` : ''}
            </div>
        `;

        const experienceContent = document.getElementById('experienceContent');
        if (experienceContent) {
            experienceContent.innerHTML = experienceHTML;
        }
    }

    renderAchievementsTab() {
        const doctor = this.doctorData;
        const achievements = doctor.achievements || 'Recognized for excellence in medical practice and patient care';

        const achievementsHTML = `
            <div class="achievements-grid">
                <div class="achievement-card">
                    <h3>
                        <span class="achievement-icon"><i class="fas fa-trophy"></i></span>
                        Professional Achievements
                    </h3>
                    <p>${achievements}</p>
                </div>

                <div class="achievement-card">
                    <h3>
                        <span class="achievement-icon"><i class="fas fa-star"></i></span>
                        Recognition & Awards
                    </h3>
                    <p>Rated ${doctor.rating || 0}/5 stars by ${doctor.total_reviews || 0} patients</p>
                    <p>${doctor.success_rate || 0}% success rate in treatments</p>
                </div>

                ${doctor.is_verified ? `
                <div class="achievement-card">
                    <h3>
                        <span class="achievement-icon"><i class="fas fa-certificate"></i></span>
                        Certifications
                    </h3>
                    <p>Verified medical professional with recognized credentials</p>
                </div>
                ` : ''}
            </div>
        `;

        const achievementsContent = document.getElementById('achievementsContent');
        if (achievementsContent) {
            achievementsContent.innerHTML = achievementsHTML;
        }
    }

    renderAvailabilityTab() {
        const doctor = this.doctorData;
        const availability = doctor.availability || 'Please contact for availability details';
        const phone = doctor.phone || 'Contact hospital for details';
        const email = doctor.email || 'info@godslifehealthcare.com';

        const availabilityHTML = `
            <div class="booking-section">
                <h3><i class="fas fa-calendar-alt"></i> Availability</h3>
                <div class="availability-info">
                    <p><strong>Status:</strong> ${doctor.is_available ? 'Available for consultation' : 'Currently not available'}</p>
                    <p><strong>Schedule:</strong> ${availability}</p>
                    <p><strong>Consultation Fee:</strong> $${doctor.consultation_fee || 'Contact for pricing'}</p>
                </div>

                <h3><i class="fas fa-phone"></i> Contact Information</h3>
                <div class="contact-options">
                    <div class="contact-card">
                        <i class="fas fa-phone-alt"></i>
                        <h4>Phone</h4>
                        <p>${phone}</p>
                    </div>
                    <div class="contact-card">
                        <i class="fas fa-envelope"></i>
                        <h4>Email</h4>
                        <p>${email}</p>
                    </div>
                    <div class="contact-card">
                        <i class="fas fa-hospital"></i>
                        <h4>Hospital</h4>
                        <p>${doctor.hospital?.name || doctor.hospital_name || 'Contact for details'}</p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 2rem;">
                   <button class="cta-btn primary" style="max-width: 400px; width: 100%;" onclick="bookDoctor('${(doctor.title + ' ' + doctor.first_name + ' ' + doctor.last_name).trim().replace(/'/g, "\\'")}', '${(doctor.specialty?.name || 'General Medicine').replace(/'/g, "\\'")}')">
                        <i class="fas fa-calendar-check"></i>
                        Book Consultation Now
                    </button>
                </div>
            </div>
        `;

        const availabilityContent = document.getElementById('availabilityContent');
        if (availabilityContent) {
            availabilityContent.innerHTML = availabilityHTML;
        }
    }

    async renderRelatedDoctors() {
        try {
            console.log('Loading related doctors...');
            const allDoctors = await this.apiService.fetchAllDoctors();

            const relatedDoctors = allDoctors
                .filter(doc => doc.id !== this.doctorData.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const relatedHTML = relatedDoctors.map(doctor => {
                const fullName = `${doctor.title || ''} ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();
                const imageUrl = getFullImagePath(doctor.profile_image_url || doctor.profile_image);
                const specialty = doctor.specialty?.name || doctor.specialty_name || 'Medical Specialist';
                const hospital = doctor.hospital?.name || doctor.hospital_name || '';
                const yearsExp = doctor.years_of_experience || 0;

                return `
                    <div class="related-doctor-card" onclick="window.location.href='doctor-detail.html?id=${doctor.id}'">
                        <img src="${imageUrl}" alt="${fullName}" class="related-doctor-image"
                             onerror="this.src='https://via.placeholder.com/280x250?text=Doctor'">
                        <div class="related-doctor-info">
                            <h3 class="related-doctor-name">${fullName}</h3>
                            <p class="related-doctor-specialty">${specialty}</p>
                            <div class="related-doctor-meta">
                                <span><i class="fas fa-hospital"></i> ${hospital}</span>
                                <span><i class="fas fa-award"></i> ${yearsExp}+ years</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            const relatedContainer = document.getElementById('relatedDoctors');
            if (relatedContainer) {
                relatedContainer.innerHTML = relatedHTML || '<p>No related doctors available</p>';
                console.log('✓ Related doctors loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading related doctors:', error);
            const relatedContainer = document.getElementById('relatedDoctors');
            if (relatedContainer) {
                relatedContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Unable to load related doctors at this time.</p>';
            }
        }
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.profile-tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.classList.add('active');
                }

                // Smooth scroll to tabs section on mobile
                if (window.innerWidth < 768) {
                    const tabsSection = document.querySelector('.profile-tabs');
                    if (tabsSection) {
                        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            });
        });
    }
}


function bookDoctor(doctorName, specialty) {
    try {
        console.log('Booking doctor:', doctorName, specialty);

        // Check if booking function exists
        if (typeof window.bookDoctor === 'function') {
            window.bookDoctor(doctorName, specialty);
        } else if (typeof window.bookCustom === 'function') {
            window.bookCustom({
                name: doctorName,
                type: 'Doctor',
                specialization: specialty
            });
        } else {
            // Fallback: show alert with contact info
            const message = `Booking Dr. ${doctorName} (${specialty})\n\nPlease contact us:\nPhone: +977 9848076466\nEmail: info@godslifehealthcare.com`;
            alert(message);
        }
    } catch (error) {
        console.error('Booking error:', error);
        // Fallback contact method
        const message = `To book Dr. ${doctorName}, please contact:\n\nPhone: +977 9848076466\nWhatsApp: https://wa.me/9779848076466\nEmail: info@godslifehealthcare.com`;
        alert(message);
    }
}


let profilePage;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilePage);
} else {
    initProfilePage();
}

function initProfilePage() {
    try {
        profilePage = new DoctorProfilePage();
        profilePage.init();

        // Expose for debugging
        window.profilePage = profilePage;

        console.log('✓ Doctor profile page initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize doctor profile page:', error);

        // Show user-friendly error
        const errorOverlay = document.getElementById('errorOverlay');
        if (errorOverlay) {
            errorOverlay.style.display = 'flex';
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Failed to initialize page. Please refresh and try again.';
            }
        }
    }
}


window.toggleMenu = toggleMenu;