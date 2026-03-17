
const API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000',
    endpoints: {
        hospitals: '/api/hospitals/hospitals/',
        hospitalDetail: '/api/hospitals/hospitals/{slug}/',
        featuredHospitals: '/api/hospitals/hospitals/featured/',
        bookings: '/api/hospitals/bookings/',
        bookingDetail: '/api/hospitals/bookings/{id}/',
        treatments: '/api/hospitals/hospitals/{slug}/treatments/',
        doctors: '/api/hospitals/hospitals/{slug}/doctors/',
        awards: '/api/hospitals/hospitals/{slug}/awards/',
    },
    timeout: 30000,
    retry: {
        enabled: false,
        maxRetries: 1,
        delayMs: 500
    },
    whatsapp: {
        companyNumber: '9779708095535',
        enabled: true

    }
};


function getURLParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(amount, currency = 'NPR') {
    if (!amount) return 'Price on request';
    return `${currency} ${formatNumber(amount)}`;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return '';
    return new Date('1970-01-01T' + timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getFullImageURL(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('/media/')) {
        return `${API_CONFIG.baseURL}${imagePath}`;
    }
    return `${API_CONFIG.baseURL}/media/${imagePath}`;
}

function getPlaceholder(width, height, text) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23667eea' width='${width}' height='${height}'/%3E%3Ctext fill='%23ffffff' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${text}%3C/text%3E%3C/svg%3E`;
}
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamIcon = document.querySelector('.ham-icon');

    navMenu.classList.toggle('active');
    hamIcon.classList.toggle('active');

    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
        const navMenu = document.querySelector('.nav-menu');
        const hamIcon = document.querySelector('.ham-icon');

        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamIcon.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('click', function (event) {
    const navMenu = document.querySelector('.nav-menu');
    const hamIcon = document.querySelector('.ham-icon');
    const logo = document.querySelector('.logo');

    if (!navMenu.contains(event.target) && !hamIcon.contains(event.target) && !logo.contains(event.target)) {
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamIcon.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});



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
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    async fetchWithRetry(url, options = {}, retryCount = 0) {
        if (!options.method || options.method === 'GET') {
            const cachedData = this.getFromCache(url);
            if (cachedData) {
                console.log(`✓ Cache hit: ${url}`);
                return cachedData;
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            console.log(`→ Fetching: ${url}`);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (response.status === 404) {
                console.warn(`⚠️ 404: ${url}`);
                return [];
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ ${response.status}: ${url}`);
                return [];
            }

            const data = await response.json();
            console.log(`✓ Success: ${url}`);

            if (!options.method || options.method === 'GET') {
                this.setCache(url, data);
            }

            return data;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`⏱️ Timeout: ${url}`);
            } else {
                console.error(`❌ Error: ${url}`, error.message);
            }
            return [];
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    buildURL(endpoint, params = {}) {
        let url = `${this.config.baseURL}${endpoint}`;
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        return url;
    }

    async fetchHospitals(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const url = this.buildURL(this.config.endpoints.hospitals) +
            (queryParams ? '?' + queryParams : '');
        const data = await this.fetchWithRetry(url);
        return Array.isArray(data) ? data : (data.results || []);
    }

    async fetchHospitalDetail(slug) {
        const url = this.buildURL(this.config.endpoints.hospitalDetail, { slug });
        return await this.fetchWithRetry(url);
    }

    async fetchFeaturedHospitals() {
        const url = this.buildURL(this.config.endpoints.featuredHospitals);
        const data = await this.fetchWithRetry(url);
        return Array.isArray(data) ? data : (data.results || []);
    }

    async createBooking(bookingData) {
        const url = this.buildURL(this.config.endpoints.bookings);
        const data = await this.fetchWithRetry(url, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        this.clearCache('bookings');
        return data;
    }
}


class WhatsAppService {
    constructor(config) {
        this.config = config;
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    formatBookingMessage(bookingData, hospitalName) {
        return `New Appointment Booking

Hospital: ${hospitalName}
Patient: ${bookingData.patient_name}
Email: ${bookingData.patient_email}
Phone: ${bookingData.patient_phone}
${bookingData.patient_age ? `Age: ${bookingData.patient_age}` : ''}
${bookingData.patient_gender ? `Gender: ${bookingData.patient_gender}` : ''}

Date: ${bookingData.preferred_date}
Time: ${bookingData.preferred_time}

${bookingData.message ? `Message: ${bookingData.message}` : ''}

Please confirm this appointment.`.trim();
    }

    sendToWhatsApp(phoneNumber, message) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

        const newWindow = window.open(whatsappURL, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = whatsappURL;
        }
    }

    sendBookingToHospital(bookingData, hospitalName) {
        const message = this.formatBookingMessage(bookingData, hospitalName);
        this.sendToWhatsApp(this.config.whatsapp.companyNumber, message);
    }
}


class HospitalsListingPage {
    constructor() {
        this.apiService = new APIService(API_CONFIG);
        this.allHospitals = [];
        this.filteredHospitals = [];
        this.displayedCount = 9;
        this.incrementCount = 6;

        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.emptyState = document.getElementById('emptyState');
        this.hospitalsGrid = document.getElementById('hospitalsGrid');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.searchInput = document.getElementById('searchInput');
        this.countryFilter = document.getElementById('countryFilter');
        this.cityFilter = document.getElementById('cityFilter');
        this.featuredFilter = document.getElementById('featuredFilter');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.resultsCount = document.getElementById('resultsCount');
    }

    async init() {
        try {
            this.showLoading();
            this.allHospitals = await this.apiService.fetchHospitals();

            if (this.allHospitals.length === 0) {
                this.showEmptyState();
                return;
            }

            this.filteredHospitals = [...this.allHospitals];
            this.populateFilters();
            this.setupEventListeners();
            this.renderHospitals();
            this.updateResultsCount();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to load hospitals');
        }
    }

    showLoading() {
        if (this.loadingState) this.loadingState.style.display = 'block';
        if (this.errorState) this.errorState.style.display = 'none';
        if (this.emptyState) this.emptyState.style.display = 'none';
        if (this.hospitalsGrid) this.hospitalsGrid.style.display = 'none';
    }

    hideLoading() {
        if (this.loadingState) this.loadingState.style.display = 'none';
        if (this.hospitalsGrid) this.hospitalsGrid.style.display = 'grid';
    }

    showError(message) {
        if (this.loadingState) this.loadingState.style.display = 'none';
        if (this.errorState) {
            this.errorState.style.display = 'block';
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) errorMessage.textContent = message;
        }
    }

    showEmptyState() {
        if (this.loadingState) this.loadingState.style.display = 'none';
        if (this.emptyState) this.emptyState.style.display = 'block';
        if (this.hospitalsGrid) this.hospitalsGrid.style.display = 'none';
    }

    populateFilters() {
        const cities = [...new Set(
            this.allHospitals
                .map(h => h.city?.name || h.city)
                .filter(Boolean)
        )].sort();

        if (this.cityFilter) {
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                this.cityFilter.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.applyFilters());
        }

        [this.cityFilter, this.featuredFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });

        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
    }

    applyFilters() {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        const selectedCity = this.cityFilter?.value || '';
        const selectedFeatured = this.featuredFilter?.value || '';

        this.filteredHospitals = this.allHospitals.filter(hospital => {
            const cityName = hospital.city?.name || hospital.city || '';

            const matchesSearch = !searchTerm ||
                hospital.name.toLowerCase().includes(searchTerm) ||
                cityName.toLowerCase().includes(searchTerm) ||
                hospital.overview?.toLowerCase().includes(searchTerm);

            const matchesCity = !selectedCity || cityName === selectedCity;
            const matchesFeatured = !selectedFeatured ||
                (selectedFeatured === 'featured' && hospital.is_featured);

            return matchesSearch && matchesCity && matchesFeatured;
        });

        this.displayedCount = 9;
        this.renderHospitals();
        this.updateResultsCount();
    }

    clearFilters() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.cityFilter) this.cityFilter.value = '';
        if (this.featuredFilter) this.featuredFilter.value = '';
        this.applyFilters();
    }

    renderHospitals() {
        if (!this.hospitalsGrid) return;

        if (this.filteredHospitals.length === 0) {
            this.showEmptyState();
            if (this.loadMoreContainer) this.loadMoreContainer.style.display = 'none';
            return;
        }

        if (this.emptyState) this.emptyState.style.display = 'none';
        this.hospitalsGrid.style.display = 'grid';

        const hospitalsToShow = this.filteredHospitals.slice(0, this.displayedCount);
        this.hospitalsGrid.innerHTML = hospitalsToShow.map(h => this.createHospitalCard(h)).join('');

        if (this.loadMoreContainer) {
            this.loadMoreContainer.style.display =
                this.displayedCount < this.filteredHospitals.length ? 'block' : 'none';
        }
    }

    createHospitalCard(hospital) {
        const cityName = hospital.city?.name || hospital.city || '';
        const location = cityName || 'Location not specified';
        const overview = truncateText(hospital.overview || 'Premier healthcare facility', 150);
        const imageUrl = hospital.image || getPlaceholder(400, 250, 'Hospital');

        return `
            <div class="hospital-card" onclick="window.location.href='hospital-detail.html?slug=${hospital.slug}'">
                <div class="hospital-image-container">
                    <img src="${imageUrl}" alt="${hospital.name}" class="hospital-image"
                         onerror="this.src='${getPlaceholder(400, 250, 'Hospital')}'">
                    ${hospital.is_featured ? `
                        <div class="hospital-badge featured">
                            <i class="fas fa-star"></i> Featured
                        </div>
                    ` : ''}
                </div>

                <div class="hospital-info">
                    <h2 class="hospital-name">${hospital.name}</h2>
                    <p class="hospital-location">
                        <i class="fas fa-map-marker-alt"></i> ${location}
                    </p>
                    <p class="hospital-overview">${overview}</p>

                    ${(hospital.specialties && hospital.specialties.length > 0) ? `
                        <div class="hospital-specialities">
                            ${hospital.specialties.slice(0, 3).map(s => `
                                <span class="speciality-chip">${s.name}</span>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="hospital-actions">
                        <button class="btn-view-details" onclick="event.stopPropagation(); window.location.href='hospital-detail.html?slug=${hospital.slug}'">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn-book-now" onclick="event.stopPropagation(); openBookingModal('${hospital.slug}', ${hospital.id}, '${hospital.name.replace(/'/g, "\\'")}')">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadMore() {
        this.displayedCount += this.incrementCount;
        this.renderHospitals();
    }

    updateResultsCount() {
        if (this.resultsCount) {
            const showing = Math.min(this.displayedCount, this.filteredHospitals.length);
            this.resultsCount.textContent =
                `Showing ${showing} of ${this.filteredHospitals.length} hospitals`;
        }
    }
}


class HospitalDetailPage {
    constructor() {
        this.apiService = new APIService(API_CONFIG);
        this.hospitalData = null;
        this.hospitalSlug = getURLParameter('slug');

        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorOverlay = document.getElementById('errorOverlay');
        this.hospitalHero = document.getElementById('hospitalHero');
        this.breadcrumbName = document.getElementById('breadcrumbName');
    }

    async init() {
        if (!this.hospitalSlug) {
            this.showError('No hospital specified');
            return;
        }

        try {
            this.showLoading();

            console.log(`🏥 Loading hospital: ${this.hospitalSlug}`);
            this.hospitalData = await this.apiService.fetchHospitalDetail(this.hospitalSlug);

            if (!this.hospitalData || Array.isArray(this.hospitalData)) {
                this.showError('Hospital not found');
                return;
            }

            console.log('✓ Hospital data loaded:', this.hospitalData);

            // Render ALL sections (data is in hospitalData!)
            this.renderHospitalHero();
            this.renderOverviewTab();
            this.renderAboutTab();
            this.renderSpecialtiesTab();
            this.renderFacilitiesTab();
            this.renderTreatmentsTab();
            this.renderDoctorsTab();
            this.renderAwardsTab();
            this.renderAccreditationsTab();

            this.setupTabSwitching();
            this.hideLoading();

            console.log('✅ All sections rendered!');

        } catch (error) {
            console.error('Failed to load hospital:', error);
            this.showError('Failed to load hospital details');
        }
    }

    showLoading() {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        if (this.errorOverlay) {
            this.errorOverlay.style.display = 'flex';
            const errorMessage = document.getElementById('errorMessageDetail');
            if (errorMessage) errorMessage.textContent = message;
        }
    }

    renderHospitalHero() {
        const h = this.hospitalData;
        if (!h) return;

        document.title = `${h.name} - Hospital Details`;
        if (this.breadcrumbName) this.breadcrumbName.textContent = h.name;

        const cityName = h.city || '';
        const location = cityName || 'Location not specified';
        const imageUrl = h.image || getPlaceholder(800, 400, h.name || 'Hospital');

        const heroHTML = `
            <div class="hospital-hero-image">
                <img src="${imageUrl}" alt="${h.name}" class="hospital-main-image"
                     onerror="this.src='${getPlaceholder(800, 400, 'Hospital')}'">
            </div>

            <div class="hospital-main-info">
                <h1>${h.name}</h1>
                <p class="hospital-location-detail">
                    <i class="fas fa-map-marker-alt"></i> ${location}
                </p>

                ${h.address ? `<p class="hospital-address"><i class="fas fa-map"></i> ${h.address}</p>` : ''}

                <div class="hospital-quick-stats">
                    ${h.specialties && h.specialties.length > 0 ? `
                        <div class="stat-box">
                            <i class="fas fa-stethoscope"></i>
                            <div>
                                <span class="stat-value">${h.specialties.length}</span>
                                <span class="stat-label">Specialties</span>
                            </div>
                        </div>
                    ` : ''}
                    ${h.total_beds ? `
                        <div class="stat-box">
                            <i class="fas fa-bed"></i>
                            <div>
                                <span class="stat-value">${h.total_beds}</span>
                                <span class="stat-label">Total Beds</span>
                            </div>
                        </div>
                    ` : ''}
                    ${h.doctors && h.doctors.length > 0 ? `
                        <div class="stat-box">
                            <i class="fas fa-user-md"></i>
                            <div>
                                <span class="stat-value">${h.doctors.length}</span>
                                <span class="stat-label">Doctors</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="hospital-badges">
                    ${h.is_featured ? '<span class="badge featured"><i class="fas fa-star"></i> Featured</span>' : ''}
                    ${h.enable_online_booking ? '<span class="badge verified"><i class="fas fa-check-circle"></i> Online Booking</span>' : ''}
                </div>
            </div>

            <div class="hospital-cta-box">
                <h3>Book Appointment</h3>
                <p>Schedule your consultation today</p>
                <button class="cta-action-btn" onclick="openBookingModal('${h.slug}', ${h.id}, '${h.name.replace(/'/g, "\\'")}', '${h.booking_email || ''}')">
                    <i class="fas fa-calendar-check"></i> Book via WhatsApp
                </button>
                ${h.booking_email ? `
                    <div class="contact-info-detail">
                        <p class="contact-email">
                            <i class="fas fa-envelope"></i> ${h.booking_email}
                        </p>
                    </div>
                ` : ''}
            </div>
        `;

        if (this.hospitalHero) {
            this.hospitalHero.innerHTML = heroHTML;
        }
    }

    renderOverviewTab() {
        const h = this.hospitalData;
        const description = h.overview || 'Premier healthcare facility.';

        const html = `
            <h2 class="section-title-tab">Hospital Overview</h2>
            <div class="overview-content">
                <p>${description.replace(/\n/g, '<br>')}</p>
            </div>
        `;

        const element = document.getElementById('overviewContent');
        if (element) element.innerHTML = html;
    }

    renderAboutTab() {
        const h = this.hospitalData;

        let html = '<h2 class="section-title-tab">About Us</h2>';
        html += '<div class="about-sections">';

        if (h.overview) {
            html += `
                <div class="about-section">
                    <h3>Overview</h3>
                    <p>${h.overview.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }

        if (h.about_sections && h.about_sections.length > 0) {
            h.about_sections.forEach(section => {
                html += `
                    <div class="about-section">
                        <h3>${section.title}</h3>
                        <p>${section.content.replace(/\n/g, '<br>')}</p>
                    </div>
                `;
            });
        }

        if (h.address) {
            html += `
                <div class="about-section">
                    <h3><i class="fas fa-map-marker-alt"></i> Location</h3>
                    <p>${h.address}</p>
                    ${h.city ? `<p><strong>City:</strong> ${h.city}</p>` : ''}
                    ${h.country ? `<p><strong>Country:</strong> ${h.country}</p>` : ''}
                </div>
            `;
        }

        if (h.total_beds || h.icu_beds || h.operation_theatres) {
            html += `
                <div class="about-section">
                    <h3><i class="fas fa-hospital"></i> Capacity</h3>
                    ${h.total_beds ? `<p><strong>Total Beds:</strong> ${h.total_beds}</p>` : ''}
                    ${h.icu_beds ? `<p><strong>ICU Beds:</strong> ${h.icu_beds}</p>` : ''}
                    ${h.operation_theatres ? `<p><strong>Operation Theatres:</strong> ${h.operation_theatres}</p>` : ''}
                </div>
            `;
        }

        if (h.booking_email) {
            html += `
                <div class="about-section">
                    <h3><i class="fas fa-address-card"></i> Contact</h3>
                    <p><i class="fas fa-envelope"></i> ${h.booking_email}</p>
                </div>
            `;
        }

        html += '</div>';

        const element = document.getElementById('aboutContent');
        if (element) element.innerHTML = html;
    }

    renderSpecialtiesTab() {
        const specialties = this.hospitalData.specialties || [];

        let html = '<h2 class="section-title-tab">Medical Specialties</h2>';

        if (specialties.length === 0) {
            html += '<div class="empty-state"><p>No specialties available</p></div>';
        } else {
            html += '<div class="specialties-grid">';
            specialties.forEach(specialty => {
                html += `
                    <div class="specialty-card">
                        <div class="specialty-card-header">
                            ${specialty.icon ? `<i class="${specialty.icon}"></i>` : '<i class="fas fa-stethoscope"></i>'}
                            <div>
                                <h3>${specialty.name}</h3>
                            </div>
                        </div>
                        ${specialty.description ? `<p>${specialty.description.replace(/\n/g, '<br>')}</p>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        const element = document.getElementById('specialtiesContent');
        if (element) {
            element.innerHTML = html;
            console.log(`✓ Rendered ${specialties.length} specialties`);
        }
    }

    renderFacilitiesTab() {
        const h = this.hospitalData;
        let html = '<h2 class="section-title-tab">Facilities & Amenities</h2>';

        const facilities = h.facilities || [];
        const amenities = h.amenities || [];
        const allFacilities = [...facilities, ...amenities];

        console.log(`🏥 Rendering ${allFacilities.length} facilities`);

        if (allFacilities.length === 0) {
            html += '<div class="empty-state"><p>No facilities available</p></div>';
        } else {
            html += '<div class="facilities-grid">';
            allFacilities.forEach(facility => {
                html += `
                    <div class="facility-card">
                        <div class="facility-card-header">
                            ${facility.icon ? `<i class="${facility.icon}"></i>` : '<i class="fas fa-check-circle"></i>'}
                            <h4>${facility.title}</h4>
                        </div>
                         ${facility.description ? `<p>${facility.description.replace(/\n/g, '<br>')}</p>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        const element = document.getElementById('facilitiesContent');
        if (element) {
            element.innerHTML = html;
            console.log(`✓ Facilities rendered`);
        }
    }

    renderTreatmentsTab() {
        const treatments = this.hospitalData.treatment_packages || [];

        let html = '<h2 class="section-title-tab">Available Treatments</h2>';

        console.log(`💉 Rendering ${treatments.length} treatments`);

        if (treatments.length === 0) {
            html += '<div class="empty-state"><p>No treatments available</p></div>';
        } else {
            html += '<div class="treatments-grid">';
            treatments.forEach(treatment => {
                const name = treatment.treatment_name;
                const description = treatment.description || '';
                const minCost = treatment.min_cost;
                const maxCost = treatment.max_cost;

                let priceDisplay = 'Price on request';
                if (minCost && maxCost) {
                    priceDisplay = `NPR ${formatNumber(minCost)} - ${formatNumber(maxCost)}`;
                } else if (minCost) {
                    priceDisplay = `From NPR ${formatNumber(minCost)}`;
                } else if (maxCost) {
                    priceDisplay = `Up to NPR ${formatNumber(maxCost)}`;
                }

                html += `
                    <div class="treatment-card">
                        <div class="treatment-card-header">
                            <div class="treatment-icon">
                                <i class="fas fa-medkit"></i>
                            </div>
                            <div>
                                <h3>${name}</h3>
                            </div>
                        </div>
                        ${description ? `<p class="treatment-description">${truncateText(description, 150)}</p>` : ''}
                        <div class="treatment-meta">
                            <span class="treatment-price">${priceDisplay}</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        const element = document.getElementById('treatmentsContent');
        if (element) {
            element.innerHTML = html;
            console.log(`✓ Treatments rendered`);
        }
    }

    renderDoctorsTab() {
        const doctors = this.hospitalData.doctors || [];

        let html = '<h2 class="section-title-tab">Our Medical Team</h2>';

        console.log(`👨‍⚕️ Rendering ${doctors.length} doctors`);

        if (doctors.length === 0) {
            html += '<div class="empty-state"><p>No doctors available</p></div>';
        } else {
            html += '<div class="doctors-grid">';
            doctors.forEach(doctor => {
                const name = doctor.full_name;
                const specialty = doctor.specialization || '';
                const experience = doctor.years_experience || '';
                const imageUrl = doctor.profile_image || getPlaceholder(200, 250, name.charAt(0));

                html += `
                    <div class="doctor-card">
                        <div class="doctor-image-container">
                            <img src="${imageUrl}" alt="${name}" class="doctor-image"
                                 onerror="this.src='${getPlaceholder(600, 750, name.charAt(0))}'">
                        </div>
                        <div class="doctor-details">
                            <h3 class="doctor-name">${name}</h3>
                            ${specialty ? `<p class="doctor-specialty"><i class="fas fa-stethoscope"></i> ${specialty}</p>` : ''}
                            ${experience ? `<p class="doctor-experience"><i class="fas fa-award"></i> ${experience} years experience</p>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        const element = document.getElementById('doctorsContent');
        if (element) {
            element.innerHTML = html;
            console.log(`✓ Doctors rendered`);
        }
    }

    renderAwardsTab() {
        const awards = this.hospitalData.awards || [];

        let html = '<h2 class="section-title-tab">Awards & Recognition</h2>';

        console.log(`🏆 Rendering ${awards.length} awards`);

        if (awards.length === 0) {
            html += '<div class="empty-state"><p>No awards available</p></div>';
        } else {
            html += '<div class="awards-grid">';
            awards.forEach(award => {
                const name = award.title;
                const description = award.description || '';
                const year = award.year || '';
                const awardedBy = award.awarded_by || '';

                html += `
                    <div class="award-card">
                        <div class="award-info">
                            <div class="award-header">
                                <div class="award-icon">
                                    <i class="fas fa-trophy"></i>
                                </div>
                                <div>
                                    <h3>${name}</h3>
                                    ${year ? `<span class="award-year">${year}</span>` : ''}
                                </div>
                            </div>
                            ${awardedBy ? `<p class="award-organization"><strong>Awarded by:</strong> ${awardedBy}</p>` : ''}
                             ${description ? `<p class="award-description">${description.replace(/\n/g, '<br>')}</p>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        const element = document.getElementById('awardsContent');
        if (element) {
            element.innerHTML = html;
            console.log(`✓ Awards rendered`);
        }
    }

    renderAccreditationsTab() {
        let html = '<h2 class="section-title-tab">Accreditations & Certifications</h2>';
        html += '<div class="empty-state"><p>No accreditations available</p></div>';

        const element = document.getElementById('accreditationsContent');
        if (element) element.innerHTML = html;
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                button.classList.add('active');
                const targetPane = document.getElementById(targetTab);
                if (targetPane) targetPane.classList.add('active');
            });
        });
    }
}


class BookingModal {
    constructor() {
        this.apiService = new APIService(API_CONFIG);
        this.whatsappService = new WhatsAppService(API_CONFIG);
        this.modal = null;
        this.hospitalSlug = null;
        this.hospitalId = null;
        this.hospitalName = null;
        this.hospitalPhone = null;
    }

    async open(hospitalSlug, hospitalId, hospitalName, hospitalPhone = '') {
        this.hospitalSlug = hospitalSlug;
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
        this.hospitalPhone = hospitalPhone;

        this.render();
        this.show();
        this.setupEventListeners();
    }

    render() {
        const existing = document.getElementById('bookingModal');
        if (existing) existing.remove();

        const modalHTML = `
            <div id="bookingModal" class="modal">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeBookingModal()">&times;</span>
                    
                    <div class="booking-card__header">
                        <h3 class="booking-card__title">Book Appointment</h3>
                        <p class="booking-card__subtitle">Quick booking via WhatsApp</p>
                    </div>

                    <div class="booking-card__body">
                        <form id="bookingForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Full Name <span class="required">*</span></label>
                                    <input type="text" name="patient_name" required placeholder="Your name">
                                </div>
                                <div class="form-group">
                                    <label>Email <span class="required">*</span></label>
                                    <input type="email" name="patient_email" required placeholder="you@example.com">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phone <span class="required">*</span></label>
                                    <input type="tel" name="patient_phone" required placeholder="+977 98XXXXXXXX">
                                </div>
                                <div class="form-group">
                                    <label>Age</label>
                                    <input type="number" name="patient_age" min="1" max="120" placeholder="25">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Preferred Date <span class="required">*</span></label>
                                    <input type="date" name="preferred_date" required>
                                </div>
                                <div class="form-group">
                                    <label>Preferred Time <span class="required">*</span></label>
                                    <input type="time" name="preferred_time" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Gender</label>
                                <select name="patient_gender">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Message / Requirements</label>
                                <textarea name="message" placeholder="Describe your medical concern"></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="closeBookingModal()">Cancel</button>
                                <button type="submit" class="btn-primary">
                                    <i class="fab fa-whatsapp"></i> Send via WhatsApp
                                </button>
                            </div>
                        </form>

                        <div id="bookingResult" class="booking-result"></div>
                    </div>

                    <div class="booking-card__footer">
                        <i class="fas fa-shield-alt"></i> Secure booking via WhatsApp
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('bookingModal');
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';

            const dateInput = this.modal.querySelector('input[name="preferred_date"]');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
            }
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    setupEventListeners() {
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const bookingData = {
            patient_name: formData.get('patient_name'),
            patient_email: formData.get('patient_email'),
            patient_phone: formData.get('patient_phone'),
            patient_age: formData.get('patient_age') || null,
            patient_gender: formData.get('patient_gender') || '',
            preferred_date: formData.get('preferred_date'),
            preferred_time: formData.get('preferred_time'),
            message: formData.get('message') || ''
        };

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening WhatsApp...';

            this.whatsappService.sendBookingToHospital(bookingData, this.hospitalName);

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showResult('success', `
                <strong>✓ WhatsApp Opening...</strong>
                <p>Review and send the booking message.</p>
            `);

            form.style.display = 'none';

        } catch (error) {
            console.error('Booking error:', error);
            this.showResult('error', `
                <strong>❌ Unable to Open WhatsApp</strong>
                <p>${error.message || 'Failed to open WhatsApp.'}</p>
            `);

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Send via WhatsApp';
        }
    }

    showResult(type, message) {
        const resultDiv = document.getElementById('bookingResult');
        if (resultDiv) {
            resultDiv.className = `booking-result ${type} show`;
            resultDiv.innerHTML = message;
        }
    }
}


let bookingModal = null;

function openBookingModal(hospitalSlug, hospitalId, hospitalName, hospitalPhone = '') {
    if (!bookingModal) {
        bookingModal = new BookingModal();
    }
    bookingModal.open(hospitalSlug, hospitalId, hospitalName, hospitalPhone);
}

function closeBookingModal() {
    if (bookingModal) {
        bookingModal.hide();
    }
}


let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    try {
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'hospital-detail.html' || currentPage.includes('detail')) {
            app = new HospitalDetailPage();
            app.init();
        } else {
            app = new HospitalsListingPage();
            app.init();
        }

        window.app = app;
        window.API_CONFIG = API_CONFIG;
    } catch (error) {
        console.error('❌ Initialization failed:', error);
    }
}