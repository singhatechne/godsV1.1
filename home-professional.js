
const API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000',
    endpoints: {
        // Departments/Treatments
        departments: '/api/treatments/api/departments/all_data/',

        // Hospitals
        hospitals: '/api/hospitals/hospitals/',
        hospitalDetail: '/api/hospitals/hospitals/{slug}/',
        featuredHospitals: '/api/hospitals/hospitals/?is_featured=true',

        // Doctors
        doctors: '/api/doctors/doctors/',
        doctorDetail: '/api/doctors/doctors/{id}/',
        featuredDoctors: '/api/doctors/doctors/?is_featured=true',

        // Testimonials
        testimonials: '/api/testimonials/public/testimonials/',
    },
    timeout: 15000,
    retry: {
        enabled: true,
        maxRetries: 3,
        delayMs: 2000
    },
    whatsapp: {
        companyNumber: '9779708095535',
        enabled: true
    }
};
const STATIC_DATA = {
    footer: {
        company: {
            name: 'Gods Life Health Care',
            description: 'Providing world-class medical tourism services with compassion and excellence.'
        },
        quickLinks: [
            { name: 'Home', url: '#' },
            { name: 'Services', url: '#' },
            { name: 'Destinations', url: '#' },
            { name: 'Doctors', url: '#' },
            { name: 'Testimonials', url: '#' },
            { name: 'About Us', url: '#' },
            { name: 'Contact', url: '#' }
        ],
        medicalServices: [
            { name: 'Cardiac Surgery', url: '#' },
            { name: 'Cardiology/CVTS', url: '#' },
            { name: 'Cosmetic Surgery', url: '#' },
            { name: 'Dental Care', url: '#' },
            { name: 'ENT Treatment', url: '#' },
            { name: 'Fertility Treatments', url: '#' },
            { name: 'Neurosurgery', url: '#' },
            { name: 'Orthopedics', url: '#' }
        ],
        contact: {
            address: '123 Medical Avenue, Health City',
            phone: '+1 234 567 8900',
            email: 'info@godslifehealthcare.com'
        },
        social: {
            facebook: 'https://facebook.com',
            twitter: 'https://twitter.com',
            instagram: 'https://instagram.com',
            linkedin: 'https://linkedin.com'
        }
    }
};



function getFullImagePath(relativePath) {
    if (!relativePath) return '';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    if (relativePath.startsWith('/')) {
        return API_CONFIG.baseURL + relativePath;
    }
    return relativePath;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}


class APIService {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    getCacheKey(url) {
        return url;
    }

    getFromCache(url) {
        const cached = this.cache.get(this.getCacheKey(url));
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`✓ Cache hit: ${url}`);
            return cached.data;
        }
        return null;
    }

    setCache(url, data) {
        this.cache.set(this.getCacheKey(url), {
            data: data,
            timestamp: Date.now()
        });
    }

    async fetchWithRetry(url, options = {}, retryCount = 0) {
        // Check cache for GET requests
        if (!options.method || options.method === 'GET') {
            const cached = this.getFromCache(url);
            if (cached) return cached;
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
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retry.delayMs * Math.pow(2, retryCount);

                console.warn(`⚠️ Rate limited. Waiting ${waitTime}ms...`);

                if (retryCount < this.config.retry.maxRetries) {
                    await this.delay(waitTime);
                    return this.fetchWithRetry(url, options, retryCount + 1);
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✓ Success: ${url}`);

            // Cache successful GET responses
            if (!options.method || options.method === 'GET') {
                this.setCache(url, data);
            }

            return data;

        } catch (error) {
            if (this.config.retry.enabled &&
                retryCount < this.config.retry.maxRetries &&
                error.name !== 'AbortError') {

                const waitTime = this.config.retry.delayMs * Math.pow(2, retryCount);
                console.warn(`⚠️ Retry ${retryCount + 1}/${this.config.retry.maxRetries} after ${waitTime}ms`);

                await this.delay(waitTime);
                return this.fetchWithRetry(url, options, retryCount + 1);
            }

            console.error(`❌ Failed: ${url}`, error.message);
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Fetch featured hospitals
    async fetchFeaturedHospitals(limit = 3) {
        const url = `${this.config.baseURL}${this.config.endpoints.hospitals}?is_featured=true&limit=${limit}`;
        const data = await this.fetchWithRetry(url);
        return Array.isArray(data) ? data : (data.results || []);
    }

    // Fetch featured doctors
    async fetchFeaturedDoctors(limit = 3) {
        const url = `${this.config.baseURL}${this.config.endpoints.doctors}?is_featured=true&limit=${limit}`;
        const data = await this.fetchWithRetry(url);
        return Array.isArray(data) ? data : (data.results || []);
    }

    // Fetch departments/treatments
    async fetchDepartments() {
        const url = `${this.config.baseURL}${this.config.endpoints.departments}`;
        const data = await this.fetchWithRetry(url);

        // Handle different response structures
        if (Array.isArray(data)) return data;
        if (data?.departments && Array.isArray(data.departments)) return data.departments;
        if (data?.results && Array.isArray(data.results)) return data.results;
        return [];
    }

    // Fetch testimonials
    async fetchTestimonials(limit = 10) {
        const url = `${this.config.baseURL}${this.config.endpoints.testimonials}?limit=${limit}`;
        const data = await this.fetchWithRetry(url);
        return Array.isArray(data) ? data : (data.results || []);
    }
}


class HeaderController {
    constructor() {
        this.header = document.querySelector('header');
        this.hamIcon = document.querySelector('.ham-icon');
        this.navMenu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile menu
        if (this.hamIcon && this.navMenu) {
            this.hamIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
            this.setupMenuLinks();
        }

        // Close menu on outside click
        document.addEventListener('click', (e) => this.closeMenuOnOutsideClick(e));
    }

    handleScroll() {
        if (!this.header) return;

        if (window.scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
    }

    setupMenuLinks() {
        const menuLinks = this.navMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
            });
        });
    }

    closeMenuOnOutsideClick(e) {
        if (!this.navMenu || !this.hamIcon) return;

        if (this.navMenu.classList.contains('active') &&
            !this.navMenu.contains(e.target) &&
            !this.hamIcon.contains(e.target)) {
            this.navMenu.classList.remove('active');
        }
    }
}


class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.animate-on-scroll');
        this.init();
    }

    init() {
        this.checkVisibility();
        window.addEventListener('scroll', () => this.checkVisibility());
        window.addEventListener('resize', () => this.checkVisibility());
    }

    checkVisibility() {
        this.elements.forEach(element => {
            if (this.isInViewport(element)) {
                element.classList.add('animated');
            }
        });
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        return (
            rect.top <= windowHeight * 0.85 &&
            rect.bottom >= 0
        );
    }
}


class TreatmentCarousel {
    constructor() {
        this.container = document.querySelector('.treatments-scroll');
        this.init();
    }

    init() {
        if (!this.container) return;

        // REMOVED: Wheel event that was blocking page scroll
        // The carousel now scrolls normally with the page

        // Optional: Auto-scroll within carousel
        this.setupAutoScroll();
    }

    setupAutoScroll() {
        let isScrolling = false;
        let autoScrollInterval;

        const startAutoScroll = () => {
            if (autoScrollInterval) return;

            autoScrollInterval = setInterval(() => {
                if (!isScrolling && this.container) {
                    const maxScroll = this.container.scrollWidth - this.container.clientWidth;

                    if (this.container.scrollLeft >= maxScroll) {
                        this.container.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        this.container.scrollBy({ left: 370, behavior: 'smooth' });
                    }
                }
            }, 5000);
        };

        const stopAutoScroll = () => {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
        };

        // Start auto-scroll
        startAutoScroll();

        // Pause on user interaction
        this.container.addEventListener('scroll', () => {
            isScrolling = true;
            stopAutoScroll();

            setTimeout(() => {
                isScrolling = false;
                startAutoScroll();
            }, 2000);
        });

        // Pause on hover
        this.container.addEventListener('mouseenter', stopAutoScroll);
        this.container.addEventListener('mouseleave', startAutoScroll);
    }
}


class TestimonialSlider {
    constructor() {
        this.wrapper = document.querySelector('.testimonial-wrapper');
        this.testimonials = document.querySelectorAll('.testimonial');
        this.currentIndex = 0;
        this.init();
    }

    init() {
        if (!this.wrapper || this.testimonials.length === 0) return;

        setInterval(() => this.next(), 7000);
        this.setupTouchSupport();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.scroll();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.scroll();
    }

    scroll() {
        if (!this.wrapper) return;

        const scrollAmount = this.currentIndex * this.wrapper.clientWidth;
        this.wrapper.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    setupTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.wrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;

        if (startX - endX > swipeThreshold) {
            this.next();
        } else if (endX - startX > swipeThreshold) {
            this.prev();
        }
    }
}


class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');

            if (question) {
                question.addEventListener('click', () => this.toggle(item));
            }

            if (index === 0) {
                item.classList.add('active');
            }
        });
    }

    toggle(clickedItem) {
        const isActive = clickedItem.classList.contains('active');

        this.faqItems.forEach(item => item.classList.remove('active'));

        if (!isActive) {
            clickedItem.classList.add('active');
        }
    }
}


class DynamicContentLoader {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async loadFeaturedHospitals() {
        try {
            console.log('Loading featured hospitals...');
            const hospitals = await this.apiService.fetchFeaturedHospitals(3);

            if (hospitals && hospitals.length > 0) {
                this.renderHospitals(hospitals);
                console.log('✓ Featured hospitals loaded');
            }
        } catch (error) {
            console.error('Failed to load hospitals:', error);
        }
    }

    renderHospitals(hospitals) {
        const grid = document.querySelector('.partners-grid');
        if (!grid) return;

        const partnerCards = grid.querySelectorAll('.partner-card');

        hospitals.forEach((hospital, index) => {
            if (partnerCards[index]) {
                const card = partnerCards[index];
                const nameElement = card.querySelector('.partner-name');
                const locationElement = card.querySelector('.partner-location');
                const imgElement = card.querySelector('.partner-img img');

                // Update content
                if (nameElement) nameElement.textContent = hospital.name || 'Hospital';

                if (locationElement) {
                    const city = hospital.city?.name || hospital.city || '';
                    const country = hospital.country?.name || hospital.country || '';
                    const location = [city, country].filter(Boolean).join(', ');
                    locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${location || 'Location'}`;
                }

                if (imgElement && hospital.image) {
                    imgElement.src = getFullImagePath(hospital.image);
                }

                // Update link
                if (hospital.slug) {
                    card.href = `hospital-detail.html?slug=${hospital.slug}`;
                }
            }
        });
    }
    renderFooter() {
        const footerContent = document.getElementById('footer-content');
        if (!footerContent) return;
        const { company = {}, contact = {}, quickLinks = [], medicalServices = [], social = {} } = this.data.footer || {};
        footerContent.innerHTML = `
      <div class="footer-column">
        <h3>${company.name || 'Medical Services'}</h3>
        <p>${company.description || ''}</p>
        <div class="social-icons">
          <a href="${social.facebook || '#'}"><i class="fab fa-facebook-f"></i></a>
          <a href="${social.twitter || '#'}"><i class="fab fa-twitter"></i></a>
          <a href="${social.instagram || '#'}"><i class="fab fa-instagram"></i></a>
          <a href="${social.linkedin || '#'}"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>
      ${quickLinks.length ? `
      <div class="footer-column">
        <h3>Quick Links</h3>
        <ul>${quickLinks.map(l => `<li><a href="${l.url || '#'}">${l.name || l}</a></li>`).join('')}</ul>
      </div>` : ''}
      ${medicalServices.length ? `
      <div class="footer-column">
        <h3>Medical Services</h3>
        <ul>${medicalServices.map(s => `<li><a href="${s.url || '#'}">${s.name || s}</a></li>`).join('')}</ul>
      </div>` : ''}
      <div class="footer-column">
        <h3>Contact Us</h3>
        ${contact.address ? `<p><i class="fas fa-map-marker-alt"></i> ${contact.address}</p>` : ''}
        ${contact.phone ? `<p><i class="fas fa-phone"></i> ${contact.phone}</p>` : ''}
        ${contact.email ? `<p><i class="fas fa-envelope"></i> ${contact.email}</p>` : ''}
      </div>`;
    }

    async loadFeaturedDoctors() {
        try {
            console.log('Loading featured doctors...');
            const doctors = await this.apiService.fetchFeaturedDoctors(3);

            if (doctors && doctors.length > 0) {
                this.renderDoctors(doctors);
                console.log('✓ Featured doctors loaded');
            }
        } catch (error) {
            console.error('Failed to load doctors:', error);
        }
    }

    renderDoctors(doctors) {
        const doctorCards = document.querySelectorAll('.doctor-card');
        if (doctorCards.length === 0) return;

        doctors.forEach((doctor, index) => {
            if (doctorCards[index]) {
                const card = doctorCards[index];
                const nameElement = card.querySelector('.doctor-name');
                const specialtyElement = card.querySelector('.doctor-specialty');
                const experienceElement = card.querySelector('.doctor-experience');
                const hospitalElement = card.querySelector('.doctor-hospital');
                const imgElement = card.querySelector('.doctor-img img');
                const btnElement = card.querySelector('.btn');

                // Construct full name
                const fullName = `${doctor.title || 'Dr.'} ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();

                // Update content
                if (nameElement) nameElement.textContent = fullName;
                if (specialtyElement) specialtyElement.textContent = doctor.specialty_name || doctor.specialty || 'Medical Specialist';
                if (experienceElement) experienceElement.textContent = `${doctor.years_of_experience || '10'}+ Years of Experience`;

                if (hospitalElement) {
                    const hospital = doctor.hospital_name || doctor.hospital || '';
                    const city = doctor.city_name || doctor.city || '';
                    hospitalElement.textContent = [hospital, city].filter(Boolean).join(', ');
                }

                if (imgElement && doctor.profile_image) {
                    imgElement.src = getFullImagePath(doctor.profile_image);
                }

                // Update booking button
                if (btnElement && doctor.id) {
                    btnElement.setAttribute('onclick', `bookDoctor('${fullName.replace(/'/g, "\\'")}', '${(doctor.specialty_name || 'General Medicine').replace(/'/g, "\\'")}', ${doctor.id})`);
                }
            }
        });
    }

    async loadTreatments() {
        try {
            console.log('Loading treatments/departments...');
            const departments = await this.apiService.fetchDepartments();

            if (departments && departments.length > 0) {
                this.renderTreatments(departments.slice(0, 6));
                console.log('✓ Treatments loaded');
            }
        } catch (error) {
            console.error('Failed to load treatments:', error);
        }
    }

    renderTreatments(departments) {
        const treatmentsScroll = document.querySelector('.treatments-scroll');
        if (!treatmentsScroll) return;

        // Only update if we have real data
        const treatmentCards = treatmentsScroll.querySelectorAll('.treatment-card');

        departments.forEach((dept, index) => {
            if (treatmentCards[index]) {
                const card = treatmentCards[index];
                const titleElement = card.querySelector('h3');
                const imgElement = card.querySelector('.treatment-img img');

                if (titleElement) titleElement.textContent = dept.name || dept.title || 'Treatment';

                if (imgElement && dept.main_image) {
                    imgElement.src = getFullImagePath(dept.main_image);
                }

                // Update link to go to departments page
                if (dept.slug) {
                    card.href = `departments.html#${dept.slug}`;
                } else {
                    card.href = `departments.html`;
                }
            }
        });
    }
}


class ConsultationFormHandler {
    constructor() {
        this.form = document.getElementById('consultationForm');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            await this.sendConsultationRequest(data);
            this.showMessage('success', '✓ Thank you! We will contact you soon.');
            this.form.reset();
        } catch (error) {
            this.showMessage('error', '✗ Something went wrong. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async sendConsultationRequest(data) {
        const message = `New Consultation Request

Name: ${data.name}
Country: ${data.country}
Email: ${data.email}
Phone: ${data.phone}
Concern: ${data.concern}`;

        const whatsappNumber = API_CONFIG.whatsapp.companyNumber;
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');

        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    showMessage(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            background: ${type === 'success' ? '#48bb78' : '#fc8181'};
            color: white;
            animation: fadeInUp 0.5s ease;
        `;

        this.form.appendChild(messageDiv);

        setTimeout(() => messageDiv.remove(), 5000);
    }
}


class HomePageApp {
    constructor() {
        this.apiService = new APIService(API_CONFIG);
        this.contentLoader = new DynamicContentLoader(this.apiService);
        this.modules = [];
    }

    async init() {
        try {
            console.log('🚀 Initializing Home Page...');

            // Initialize UI modules first (they work with static content)
            this.modules.push(new HeaderController());
            this.modules.push(new ScrollAnimations());
            this.modules.push(new TreatmentCarousel());
            this.modules.push(new TestimonialSlider());
            this.modules.push(new FAQAccordion());
            this.modules.push(new ConsultationFormHandler());

            // Load dynamic content after page is ready
            setTimeout(async () => {
                try {
                    await Promise.all([
                        this.contentLoader.loadFeaturedHospitals(),
                        this.contentLoader.loadFeaturedDoctors(),
                        this.contentLoader.loadTreatments()
                    ]);
                    console.log('✅ Dynamic content loaded');
                } catch (error) {
                    console.error('Dynamic content loading failed:', error);
                    // Page still works with static content
                }
            }, 1000);

            console.log('✅ Home Page Initialized Successfully');
            document.body.classList.add('loaded');

        } catch (error) {
            console.error('❌ Failed to initialize home page:', error);
        }
    }
}



// Navigate to hospital detail page
function viewHospitalDetail(slug) {
    window.location.href = `hospital-detail.html?slug=${slug}`;
}

// Navigate to doctor detail page
function viewDoctorDetail(id) {
    window.location.href = `doctor-detail.html?id=${id}`;
}

// Navigate to departments page
function viewDepartments() {
    window.location.href = 'departments.html';
}

// Navigate to specific treatment
function viewTreatment(slug) {
    window.location.href = `departments.html#${slug}`;
}



function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function formatPhoneForWhatsApp(phone) {
    return phone.replace(/\D/g, '');
}


let homePageApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
} else {
    initHomePage();
}

function initHomePage() {
    homePageApp = new HomePageApp();
    homePageApp.init();

    // Expose globally for debugging
    window.homePageApp = homePageApp;
    window.API_CONFIG = API_CONFIG;
}

// Hide loading overlay when page loads
window.addEventListener('load', function () {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => loadingOverlay.remove(), 500);
        }, 500);
    }
});

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HomePageApp,
        API_CONFIG,
        scrollToSection,
        formatPhoneForWhatsApp
    };
}