
const API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000',
  endpoints: {
    departments: '/api/treatments/api/departments/all_data/',
    doctors: '/api/doctors/doctors/',
    doctorDetail: '/api/doctors/doctors/{id}/',
    hospitals: '/api/hospitals/hospitals/',
    testimonials: '/api/testimonials/public/testimonials/',
  },
  timeout: 15000,
  retry: { enabled: true, maxRetries: 3, delayMs: 2000 },
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


class ScrollLock {
  constructor() {
    this.isLocked = false;
  }

  lock() {
    if (this.isLocked) return;
    document.body.style.overflow = 'hidden';
    this.isLocked = true;
  }

  unlock() {
    if (!this.isLocked) return;
    document.body.style.overflow = '';
    this.isLocked = false;
  }
}

const scrollLock = new ScrollLock();


(function syncHeaderHeight() {
  const setHeight = () => {
    const header = document.querySelector('.glass-header');
    if (header) {
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    }
  };
  window.addEventListener('load', setHeight);
  window.addEventListener('resize', setHeight);
  setHeight();
})();

function setMaxHeight(el, open) {
  if (!el) return;
  if (open) {

    el.style.maxHeight = 'none';
    el.style.overflow = 'visible';


    void el.offsetHeight;


    const h = el.scrollHeight;


    const bufferHeight = h + 50;

    requestAnimationFrame(() => {
      el.style.overflow = 'hidden';
      el.style.maxHeight = bufferHeight + 'px';


      setTimeout(() => {
        if (el.classList.contains('active')) {
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
        }
      }, 450);
    });
  } else {
    el.style.overflow = 'hidden';
    el.style.maxHeight = '0px';
  }
}

function toggleMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const hamIcon = document.querySelector('.ham-icon');
  const navOverlay = document.querySelector('.nav-overlay');

  if (!navMenu || !hamIcon) return;


  navMenu.classList.toggle('active');
  hamIcon.classList.toggle('active');

  if (navOverlay) {
    navOverlay.classList.toggle('active');
  }


  if (navMenu.classList.contains('active')) {
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  } else {
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function () {
    const navMenu = document.querySelector('.nav-menu');
    const hamIcon = document.querySelector('.ham-icon');
    const navOverlay = document.querySelector('.nav-overlay');

    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamIcon?.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  });
});

document.addEventListener('click', function (event) {
  const navMenu = document.querySelector('.nav-menu');
  const hamIcon = document.querySelector('.ham-icon');
  const logo = document.querySelector('.logo');
  const navOverlay = document.querySelector('.nav-overlay');

  if (!navMenu || !hamIcon) return;


  if (!navMenu.contains(event.target) &&
    !hamIcon.contains(event.target) &&
    !logo.contains(event.target)) {

    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamIcon.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  }
});

function loadLanguagePreference() {
  const savedLang = localStorage.getItem('preferredLanguage');
  if (savedLang && translations[savedLang]) {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = savedLang;
      changeLanguage(savedLang);
    }
  }
}


(function () {
  const hideLoader = function () {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 600);
    }
  };

  window.addEventListener('load', function () {
    setTimeout(hideLoader, 1500);
  });

  setTimeout(hideLoader, 3000);

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(hideLoader, 2000);
  });
})();


window.addEventListener('scroll', function () {
  const header = document.querySelector('.glass-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


function closeSiblings(currentItem, itemSelector, headerSelector, contentSelector, activeClass) {
  const parent = currentItem.parentElement;
  const siblings = parent.querySelectorAll(itemSelector);
  siblings.forEach((sib) => {
    if (sib === currentItem) return;
    sib.classList.remove('active');
    const header = sib.querySelector(headerSelector);
    const content = sib.querySelector(contentSelector);
    header?.classList.remove('active');
    content?.classList.remove('active');
    setMaxHeight(content, false);
    header?.setAttribute('aria-expanded', 'false');
    content?.setAttribute('aria-hidden', 'true');
  });
}


function bindAccordionGroup({
  scope,
  itemSelector,
  headerSelector,
  contentSelector,
  openFirst = false,
}) {
  const items = scope.querySelectorAll(itemSelector);
  items.forEach((item, idx) => {
    const header = item.querySelector(headerSelector);
    const content = item.querySelector(contentSelector);
    if (!header || !content) return;


    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
    content.setAttribute('aria-hidden', item.classList.contains('active') ? 'false' : 'true');

    const toggle = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const isActive = item.classList.contains('active');

      if (isActive) {
        item.classList.remove('active');
        header.classList.remove('active');
        content.classList.remove('active');
        setMaxHeight(content, false);
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
      } else {
        closeSiblings(item, itemSelector, headerSelector, contentSelector, 'active');
        item.classList.add('active');
        header.classList.add('active');
        content.classList.add('active');
        setMaxHeight(content, true);
        header.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');


        setTimeout(() => {
          const rect = header.getBoundingClientRect();
          const headerHeight = document.querySelector('.glass-header')?.offsetHeight || 0;

          if (rect.top < headerHeight) {
            window.scrollTo({
              top: window.pageYOffset + rect.top - headerHeight - 20,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(e);
      }
    });


    if (item.classList.contains('active')) {
      setMaxHeight(content, true);
    } else if (openFirst && idx === 0) {
      header.click();
    }
  });


  const recompute = () => {
    scope.querySelectorAll(`${itemSelector}.active ${contentSelector}`).forEach((c) =>
      setMaxHeight(c, true)
    );
  };
  window.addEventListener('resize', recompute);
}


function initAccordions() {

  document.querySelectorAll('.collapsible-tabs').forEach((group) => {
    bindAccordionGroup({
      scope: group,
      itemSelector: '.collapsible-tab',
      headerSelector: '.collapsible-tab-header',
      contentSelector: '.collapsible-tab-content',
      openFirst: false,
    });


    group.querySelectorAll('.tab-treatments-grid').forEach((nested) => {
      bindAccordionGroup({
        scope: nested,
        itemSelector: '.tab-treatment-card',
        headerSelector: '.tab-treatment-header',
        contentSelector: '.tab-treatment-body',
        openFirst: false,
      });
    });
  });
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccordions);
} else {
  initAccordions();
}

function getFullImagePath(relativePath) {
  if (relativePath && relativePath.startsWith('/')) {
    return API_CONFIG.baseURL + relativePath;
  }
  return relativePath;
}

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}


function transformDepartmentData(backendDept) {
  try {
    const transformed = {
      id: backendDept.slug || backendDept.id,
      name: backendDept.name || '',
      icon: backendDept.icon || '',
      title: backendDept.title || backendDept.name || '',
      subtitle: backendDept.subtitle || '',
      aboutTitle: backendDept.about_title || '',
      aboutContent: backendDept.about_content || '',
      aboutParagraphs: (backendDept.about_paragraphs || []).map(p => p.content || p),
      symptoms: (backendDept.symptoms || []).map(s => s.description || s),
      treatments: (backendDept.treatment_options || []).map(t => ({
        id: t.id || t.slug || 'treatment-' + Math.random(),
        name: t.name || '',
        icon: t.icon ? `fas ${t.icon}` : 'fas fa-procedures',
        aboutTitle: t.about_title || '',
        aboutDescription: t.about_description || '',
        additionalDescription: t.additional_description || '',
        image: getFullImagePath(t.image || ''),
        features: (t.features || []).map(f => f.feature || f),
      })),
      stats: [
        backendDept.stat1_value && backendDept.stat1_label ? { value: backendDept.stat1_value, label: backendDept.stat1_label } : null,
        backendDept.stat2_value && backendDept.stat2_label ? { value: backendDept.stat2_value, label: backendDept.stat2_label } : null,
        backendDept.stat3_value && backendDept.stat3_label ? { value: backendDept.stat3_value, label: backendDept.stat3_label } : null
      ].filter(Boolean),
      mainImage: getFullImagePath(backendDept.main_image || ''),
      collapsibleTabs: (backendDept.collapsible_tabs || []).map(tab => ({
        id: tab.id || `tab-${Math.random()}`,
        title: tab.title || '',
        contentTitle: tab.content_title || '',
        contentDescription: tab.content_description || '',
        additionalDescription: tab.additional_description || '',
        innovativeApproachesTitle: tab.innovative_approaches_title || '',
        image: getFullImagePath(tab.image || ''),
        stats: [
          tab.stat1_value && tab.stat1_label ? { value: tab.stat1_value, label: tab.stat1_label } : null,
          tab.stat2_value && tab.stat2_label ? { value: tab.stat2_value, label: tab.stat2_label } : null,
          tab.stat3_value && tab.stat3_label ? { value: tab.stat3_value, label: tab.stat3_label } : null
        ].filter(Boolean),
        innovativeApproaches: (tab.innovative_approaches || []).map(ia => ia.description || ia),
        tabTreatments: (tab.tab_treatments || []).map(tt => ({
          id: tt.id || tt.slug || 'tab-treatment-' + Math.random(),
          name: tt.name || '',
          icon: tt.icon ? `fas ${tt.icon}` : 'fas fa-procedures',
          aboutTitle: tt.about_title || '',
          aboutDescription: tt.about_description || '',
          additionalDescription: tt.additional_description || '',
          image: getFullImagePath(tt.image || ''),
          features: (tt.features || []).map(f => f.feature || f),
        }))
      }))
    };
    return transformed;
  } catch (e) {
    return {
      id: backendDept.id || 'error-' + Math.random(),
      name: backendDept.name || 'Error loading department',
      icon: '❌',
      title: backendDept.name || 'Error',
      subtitle: 'Failed to load department data',
      aboutTitle: 'Error',
      aboutContent: 'This department could not be loaded properly.',
      aboutParagraphs: [],
      symptoms: [],
      treatments: [],
      stats: [],
      mainImage: '',
      collapsibleTabs: []
    };
  }
}

function transformDoctorData(doctor) {
  return {
    id: doctor.id,
    name: doctor.title + ' ' + doctor.first_name + ' ' + doctor.last_name,
    title: doctor.title,
    image: doctor.profile_image,
    specialty: doctor.specialty_name,
    specialtyIcon: '',
    specialties: doctor.sub_specialties,
    hospital: doctor.hospital_name,
    hospitalCity: doctor.city_name,
    yearsOfExperience: doctor.years_of_experience,
    rating: doctor.rating,
    totalReviews: doctor.total_reviews,
    isAvailable: doctor.is_available,
    isFeatured: doctor.is_featured,
    isVerified: doctor.is_verified,
    bookingLink: '#book-' + doctor.slug,
    profileLink: 'doctor-detail.html?id=' + doctor.id
  };
}

function transformHospitalData(h) {
  return {
    id: h.id,
    slug: h.slug,
    name: h.name || '',
    image: h.image_url || h.image || '',
    city: h.city || '',
    country: h.country || '',
    total_beds: Number(h.total_beds) || 0,
    specialties_list: h.specialties_list || '',
    is_featured: h.is_featured || false
  };
}


class APIService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
  }

  getCacheKey(url) { return url; }

  getFromCache(url) {
    const cached = this.cache.get(this.getCacheKey(url));
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`✓ Using cached data for: ${url}`);
      return cached.data;
    }
    return null;
  }

  setCache(url, data) {
    this.cache.set(this.getCacheKey(url), { data, timestamp: Date.now() });
    console.log(`✓ Cached data for: ${url}`);
  }

  async fetchWithRetry(url, options = {}, retryCount = 0) {
    if (!options.method || options.method === 'GET') {
      const cached = this.getFromCache(url);
      if (cached) return cached;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retry.delayMs * Math.pow(2, retryCount);
        if (retryCount < this.config.retry.maxRetries) {
          await this.delay(waitTime);
          return this.fetchWithRetry(url, options, retryCount + 1);
        }
        throw new Error(`HTTP 429 - Rate limit exceeded`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.setCache(url, data);
      return data;
    } catch (error) {
      if (this.config.retry.enabled &&
        retryCount < this.config.retry.maxRetries &&
        error.name !== 'AbortError' &&
        !String(error.message).includes('429')) {
        const waitTime = this.config.retry.delayMs * Math.pow(2, retryCount);
        await this.delay(waitTime);
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      console.error(`❌ Failed to fetch ${url}:`, error);
      throw error;
    }
  }

  delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async fetchEndpoint(endpointKey, params = {}) {
    const endpoint = this.config.endpoints[endpointKey];
    if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);
    const qs = new URLSearchParams(params).toString();
    const url = `${this.config.baseURL}${endpoint}${qs ? `?${qs}` : ''}`;
    return this.fetchWithRetry(url);
  }

  async fetchAllDepartments() {
    const data = await this.fetchEndpoint('departments');
    if (Array.isArray(data)) return data.map(transformDepartmentData);
    if (data?.departments && Array.isArray(data.departments)) return data.departments.map(transformDepartmentData);
    if (data?.results && Array.isArray(data.results)) return data.results.map(transformDepartmentData);
    if (data && typeof data === 'object') return [transformDepartmentData(data)];
    return [];
  }

  async fetchAllDoctors() {
    const data = await this.fetchEndpoint('doctors');
    if (Array.isArray(data)) return data.map(transformDoctorData);
    if (data?.results && Array.isArray(data.results)) return data.results.map(transformDoctorData);
    if (data && typeof data === 'object') return [transformDoctorData(data)];
    return [];
  }

  async fetchDoctorDetail(id) {
    const endpoint = this.config.endpoints.doctorDetail.replace('{id}', id);
    const url = `${this.config.baseURL}${endpoint}`;
    const data = await this.fetchWithRetry(url);
    return transformDoctorData(data);
  }

  async fetchAllHospitals() {
    const data = await this.fetchEndpoint('hospitals');
    const list =
      Array.isArray(data) ? data
        : Array.isArray(data?.results) ? data.results
          : data ? [data] : [];
    return list.map(transformHospitalData);
  }
}


class TestimonialsModule {
  constructor(app) {
    this.app = app;
    this.testimonials = [];
    this.filteredTestimonials = [];
    this.currentIndex = 0;
    this.autoRotateInterval = null;
    this.timerInterval = null;
    this.timerValue = 0;
    this.timerDuration = 30;

    this.container = document.getElementById('testimonialsContainer');
    this.dotsContainer = document.getElementById('dotsContainer');
    this.filtersContainer = document.getElementById('filters');
  }

  async init() {
    if (!this.container) return;
    try {
      this.showLoadingState();
      await this.fetchTestimonials();
      if (this.testimonials.length === 0) {
        this.showNoDataState();
        return;
      }
      this.addServiceTypeFilters();
      this.setupFilters();
      this.renderTestimonials();
    } catch (error) {
      console.error('Testimonials initialization failed:', error);
      if (String(error.message).includes('429')) this.showRateLimitError();
      else this.showErrorState();
    }
  }

  async fetchTestimonials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.app.config.baseURL}${this.app.config.endpoints.testimonials}${queryString ? '?' + queryString : ''}`;
    const response = await this.app.apiService.fetchWithRetry(url, { method: 'GET', headers: { accept: 'application/json' } });
    this.testimonials = response.results || response || [];
    this.filteredTestimonials = [...this.testimonials];
  }

  generateStars(rating) {
    let html = '';
    const r = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) html += `<span class="star"${i > r ? ' style="color:#ddd"' : ''}>★</span>`;
    return html;
  }

  generateProfilePicture(t) {
    let imageUrl = '';
    if (t.profile_image_url) imageUrl = t.profile_image_url.startsWith('http') ? t.profile_image_url : `${this.app.config.baseURL}${t.profile_image_url}`;
    if (imageUrl) {
      return `<img src="${imageUrl}" alt="${t.name || 'Patient'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
    }
    return `<div class="profile-picture-placeholder"><i class="fas fa-user"></i></div>`;
  }

  generateYouTubeLink(t) {
    const url = t.youtube_url || t.video_url;
    if (!url) return '';
    return `<a href="${url}" class="youtube-link" target="_blank" rel="noopener"><i class="fab fa-youtube"></i> Watch Video Testimonial</a>`;
  }

  generateTestimonialHTML(t, index) {
    const serviceType = t.service_type || 'Healthcare';
    const location = t.location || '';
    const position = `${serviceType} Patient${location ? ' from ' + location.charAt(0).toUpperCase() + location.slice(1) : ''}`;

    return `
      <div class="testimonial-card ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="testimonial-header">
          <div class="profile-picture">${this.generateProfilePicture(t)}</div>
          <div class="profile-info">
            <h3 class="profile-name">${t.name || 'Anonymous Patient'}</h3>
            <p class="profile-position">${position}</p>
            ${this.generateYouTubeLink(t)}
          </div>
        </div>
        <div class="rating">${this.generateStars(t.rating)}</div>
        <p class="testimonial-text">"${t.review_text || t.testimonial || 'No review text available.'}"</p>
        <div class="testimonial-controls">
          <button class="nav-button prev" ${this.filteredTestimonials.length <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="dots-container-inner">
            ${this.filteredTestimonials.map((_, i) => `<div class="dot ${i === index ? 'active' : ''}" data-index="${i}"></div>`).join('')}
          </div>
          <button class="nav-button next" ${this.filteredTestimonials.length <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="timer-bar"><div class="timer-progress"></div></div>
      </div>`;
  }

  renderTestimonials() {
    if (this.filteredTestimonials.length === 0) {
      this.container.innerHTML = '<div class="no-data">No testimonials available at the moment.</div>';
      if (this.dotsContainer) this.dotsContainer.innerHTML = '';
      return;
    }
    this.container.innerHTML = this.filteredTestimonials.map((t, idx) => this.generateTestimonialHTML(t, idx)).join('');
    this.attachNavigationListeners();
    this.startAutoRotate();
  }

  goToTestimonial(index) {
    if (index < 0 || index >= this.filteredTestimonials.length) return;

    document.querySelectorAll('.testimonial-card').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));

    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');

    if (cards[index]) cards[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');

    this.currentIndex = index;
    this.resetTimer();
  }

  nextTestimonial() {
    this.goToTestimonial((this.currentIndex + 1) % this.filteredTestimonials.length);
  }

  prevTestimonial() {
    this.goToTestimonial((this.currentIndex - 1 + this.filteredTestimonials.length) % this.filteredTestimonials.length);
  }

  attachNavigationListeners() {
    const prevBtns = this.container.querySelectorAll('.nav-button.prev');
    const nextBtns = this.container.querySelectorAll('.nav-button.next');
    const dots = this.container.querySelectorAll('.dot');

    prevBtns.forEach(prevBtn => {
      prevBtn.addEventListener('click', () => {
        this.stopAutoRotate();
        this.prevTestimonial();
        this.startAutoRotate();
      });
    });

    nextBtns.forEach(nextBtn => {
      nextBtn.addEventListener('click', () => {
        this.stopAutoRotate();
        this.nextTestimonial();
        this.startAutoRotate();
      });
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        this.stopAutoRotate();
        this.goToTestimonial(index);
        this.startAutoRotate();
      });
    });

    this.container.addEventListener('mouseenter', () => this.pauseTimer());
    this.container.addEventListener('mouseleave', () => this.resumeTimer());
  }

  startTimer() {
    this.stopTimer();
    this.timerValue = 0;
    this.timerInterval = setInterval(() => {
      this.timerValue += 0.1;
      const progress = this.container.querySelector('.timer-progress');
      if (progress) progress.style.width = `${(this.timerValue / this.timerDuration) * 100}%`;
      if (this.timerValue >= this.timerDuration) this.nextTestimonial();
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.timerValue = 0;
    const p = this.container.querySelector('.timer-progress');
    if (p) p.style.width = '0%';
  }

  pauseTimer() { this.stopTimer(); }
  resumeTimer() { this.startTimer(); }

  startAutoRotate() {
    this.stopAutoRotate();
    if (this.filteredTestimonials.length > 1) this.startTimer();
  }

  stopAutoRotate() { this.stopTimer(); }

  filterTestimonials(filterType) {
    if (filterType === 'all') this.filteredTestimonials = [...this.testimonials];
    else if (filterType === 'featured') this.filteredTestimonials = this.testimonials.filter(t => t.is_featured);
    else this.filteredTestimonials = this.testimonials.filter(t => t.service_type === filterType);

    this.currentIndex = 0;
    this.renderTestimonials();
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-filter');
        this.filterTestimonials(type);
      });
    });
  }

  addServiceTypeFilters() {
    if (!this.filtersContainer) return;
    const types = [...new Set(this.testimonials.map(t => t.service_type).filter(Boolean))];
    types.forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.setAttribute('data-filter', type);
      btn.textContent = type;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filteredTestimonials = this.testimonials.filter(t => t.service_type === type);
        this.currentIndex = 0;
        this.renderTestimonials();
      });
      this.filtersContainer.appendChild(btn);
    });
  }

  showLoadingState() {
    if (this.container) this.container.innerHTML = '<div class="loading">Loading testimonials</div>';
  }

  showNoDataState() {
    if (this.container) this.container.innerHTML = '<div class="no-data">No testimonials available at the moment.</div>';
    if (this.dotsContainer) this.dotsContainer.innerHTML = '';
  }

  showErrorState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error">
          <p>Unable to load testimonials at this time.</p>
          <p style="font-size: 0.9rem; margin-top: 10px;">Please try again later.</p>
        </div>`;
    }
  }

  showRateLimitError() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="rate-limit-notice">
          <i class="fas fa-clock" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
          <h3>Loading Testimonials...</h3>
          <p>We're experiencing high traffic. Testimonials will load shortly.</p>
          <button class="retry-button" onclick="location.reload()" style="margin-top: 1rem; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Retry
          </button>
        </div>`;
    }
  }

  destroy() {
    this.stopAutoRotate();
    if (this.container) {
      this.container.removeEventListener('mouseenter', this.pauseTimer);
      this.container.removeEventListener('mouseleave', this.resumeTimer);
    }
  }
}


class MedicalDepartmentsApp {
  constructor(config, staticData) {
    this.config = config;
    this.apiService = new APIService(config);
    this.staticData = staticData;
    this.data = {};
    this.isLoading = false;
    this.errors = {};
    this.testimonialsModule = new TestimonialsModule(this);
  }

  async init() {
    try {
      this.showLoadingState();
      await this.loadData();

      this.data.footer = this.staticData.footer;

      if (!this.hasMinimumData()) {
        this.showErrorState('Failed to load essential data. Please try again later.');
        return;
      }

      this.initUI();
      this.setupEventListeners();
      this.initAnimations();

      this.hideLoadingState();

      setTimeout(async () => {
        try { await this.testimonialsModule.init(); } catch (e) { console.error('Testimonials load failed:', e); }
      }, 2000);
    } catch (e) {
      console.error('Application initialization failed:', e);
      this.showErrorState('Failed to initialize application. Please refresh the page.');
    }
  }

  async loadData() {
    this.isLoading = true;
    try {
      try {
        this.data.departments = await this.apiService.fetchAllDepartments();
      } catch (e) {
        this.errors.departments = e.message; this.data.departments = [];
      }

      try {
        const allDoctors = await this.apiService.fetchAllDoctors();
        this.data.doctors = allDoctors.slice(0, 10);
      } catch (e) {
        this.errors.doctors = e.message; this.data.doctors = [];
      }

      try {
        const allHospitals = await this.apiService.fetchAllHospitals();
        this.data.hospitals = allHospitals.slice(0, 10);
      } catch (e) {
        this.errors.hospitals = e.message; this.data.hospitals = [];
      }

      this.data.procedures = this.data.procedures || [];
      this.data.features = this.data.features || [];
    } finally {
      this.isLoading = false;
    }
  }

  hasMinimumData() { return Array.isArray(this.data.departments); }

  showLoadingState() {
    const main = document.querySelector('.tab-container') || document.body;
    if (!document.getElementById('loading-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-styles';
      style.textContent = `
        .loading-overlay{position:fixed;inset:0;background:rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;z-index:9999;}
        .loading-spinner{text-align:center}
        .spinner{border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin:0 auto 20px}
        @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        .error-overlay{position:fixed;inset:0;background:rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;z-index:9999}
        .error-message{text-align:center;padding:40px;max-width:500px}
        .error-message h2{color:#e74c3c;margin-bottom:20px}
        .retry-button{background:#3498db;color:#fff;border:none;padding:12px 30px;border-radius:5px;cursor:pointer;font-size:16px;margin-top:20px}
      `;
      document.head.appendChild(style);
    }
    if (!document.getElementById('loading-overlay')) {
      main.insertAdjacentHTML('beforeend', `
        <div class="loading-overlay" id="loading-overlay">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading medical information...</p>
          </div>
        </div>`);
    }
  }

  hideLoadingState() { const o = document.getElementById('loading-overlay'); if (o) o.remove(); }

  showErrorState(message) {
    this.hideLoadingState();
    const main = document.querySelector('.tab-container') || document.body;
    main.insertAdjacentHTML('beforeend', `
      <div class="error-overlay" id="error-overlay">
        <div class="error-message">
          <h2>⚠️ Oops! Something went wrong</h2>
          <p>${message}</p>
          <button class="retry-button" onclick="location.reload()">Retry</button>
        </div>
      </div>`);
  }

  initUI() {
    this.renderDepartments();
    this.renderExpertsTab();
    this.renderFeatures();
    this.renderFooter();
  }

  renderDepartments() {
    const tabsContainer = document.getElementById('department-tabs');
    const contentContainer = document.getElementById('department-content');
    if (!tabsContainer || !contentContainer) return;

    tabsContainer.innerHTML = '';
    contentContainer.innerHTML = '';

    const departments = this.data.departments || [];
    if (departments.length === 0) {
      contentContainer.innerHTML = `
        <div class="empty-state">
          <h3>No departments available</h3>
          <p>Medical department information will be displayed here.</p>
        </div>`;
      return;
    }

    departments.forEach((dept, index) => {
      const tab = document.createElement('div');
      tab.className = `vertical-tab ${index === 0 ? 'active' : 'inactive'}`;
      tab.setAttribute('data-dept', dept.id);
      tab.innerHTML = `
        <div class="tab-icon">${dept.icon || '📋'}</div>
        <div class="tab-title">${dept.name || 'Unnamed'}</div>`;
      tab.addEventListener('click', () => this.openVerticalTab(dept.id));
      tabsContainer.appendChild(tab);

      const content = document.createElement('div');
      content.id = dept.id;
      content.className = `department-content ${index === 0 ? 'active' : ''}`;
      content.innerHTML = this.generateDepartmentContent(dept);
      contentContainer.appendChild(content);
    });


    setTimeout(() => {
      initAccordions();
      this.bindTreatmentDropdownEvents();
    }, 100);
  }


  bindTreatmentDropdownEvents() {
    document.querySelectorAll('.treatment-dropdown .treatment-header').forEach(header => {
      const dropdown = header.closest('.treatment-dropdown');
      if (!dropdown) return;

      // Remove any existing listeners
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);


      newHeader.addEventListener('click', () => {
        this.toggleTreatmentDropdown(dropdown.id);
      });
    });
  }

  renderExpertsTab() {
    const expertsTab = document.getElementById('experts');
    if (!expertsTab) return;

    const hospitals = (this.data.hospitals || []).slice(0, 10);
    const doctors = (this.data.doctors || []).slice(0, 10);

    const hospitalsHtml = hospitals.length > 0 ? `
        <div class="section-title hospitals-title">
            <h2><a href="hospitals.html">Specialized Hospitals</a></h2>
            <p>Our trusted partner hospitals providing world-class healthcare</p>
        </div>
        <div class="hospitals-grid">
            ${hospitals.map((h, index) => {
      const img = h.image && String(h.image).trim() ? h.image : 'https://via.placeholder.com/640x400/667eea/ffffff?text=Hospital+Image';
      const locationParts = [];
      if (h.city && String(h.city).trim()) locationParts.push(String(h.city).trim());
      if (h.country && String(h.country).trim()) locationParts.push(String(h.country).trim());
      const location = locationParts.join(', ');
      const locationHtml = location
        ? `<div class="hospital-location" title="${location}"><i class="fas fa-location-dot"></i><span>${location}</span></div>`
        : `<div class="hospital-location no-data"><i class="fas fa-location-dot"></i><span>Location not specified</span></div>`;
      let displaySpecialties = [];
      if (h.specialties_list && typeof h.specialties_list === 'string' && h.specialties_list.trim()) {
        const specialtiesArray = h.specialties_list.split(',').map(s => s.trim()).filter(s => s.length > 0);
        displaySpecialties = specialtiesArray.slice(0, 3);
      }
      const hasMoreSpecialties = h.specialties_list && h.specialties_list.split(',').length > displaySpecialties.length;
      const specialtiesHtml = displaySpecialties.length > 0
        ? `<div class="hospital-specialties"><i class="fas fa-stethoscope"></i><div class="specialties-text"><span class="specialties-label">Specialties</span><span class="specialties-list">${displaySpecialties.join(', ')}${hasMoreSpecialties ? ', +more' : ''}</span></div></div>`
        : `<div class="hospital-specialties"><i class="fas fa-stethoscope"></i><div class="specialties-text"><span class="specialties-label">Specialties</span><span class="specialties-list">Multi-specialty Hospital</span></div></div>`;
      const beds = h.total_beds && parseInt(h.total_beds) > 0 ? parseInt(h.total_beds) : 0;
      return `
                    <div class="hospital-card${h.is_featured ? ' featured' : ''}" data-hospital-id="${h.id || index}">
                        <div class="hospital-img-wrap">
                            <img src="${img}" alt="${h.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/640x400/667eea/ffffff?text=Hospital';">
                            ${h.is_featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
                        </div>
                        <div class="hospital-content">
                            <h3 class="hospital-name" title="${h.name}">${h.name}</h3>
                            ${locationHtml}
                            ${specialtiesHtml}
                            <div class="hospital-meta">
                                <span class="beds"><i class="fas fa-bed"></i> ${beds > 0 ? beds + ' Beds' : 'Contact for info'}</span>
                            </div>
                        </div>
                        <div class="hospital-actions">
                            <a class="btn btn-view" href="hospital-detail.html?slug=${encodeURIComponent(h.slug || h.id)}" title="View ${h.name} details">
                                <i class="fas fa-eye"></i> View Details
                            </a>
                        </div>
                    </div>`;
    }).join('')}
        </div>
    ` : '<div class="empty-state"><p>Hospital information will be available soon.</p></div>';

    const doctorsHtml = doctors.length > 0 ? `
        <div class="section-title">
            <h2><a href="doctor.html">Our Expert Doctors</a></h2>
            <p>Meet our team of highly qualified medical specialists</p>
        </div>
        <div class="doctors-grid stagger-animation">
            ${doctors.map((doctor, index) => {
      const img = doctor.image && String(doctor.image).trim() ? doctor.image : 'https://via.placeholder.com/400x500/007bff/ffffff?text=Doctor';
      const doctorName = doctor.name || 'Doctor Name';
      const specialty = doctor.specialty && String(doctor.specialty).trim() ? doctor.specialty : 'General Medicine';
      const specialties = doctor.specialties && String(doctor.specialties).trim() ? doctor.specialties : '';
      const hospitalParts = [];
      if (doctor.hospital && String(doctor.hospital).trim()) hospitalParts.push(String(doctor.hospital).trim());
      if (doctor.hospitalCity && String(doctor.hospitalCity).trim()) hospitalParts.push(String(doctor.hospitalCity).trim());
      const hospitalLocation = hospitalParts.join(', ') || 'Hospital information available on profile';
      const experience = doctor.yearsOfExperience && parseInt(doctor.yearsOfExperience) > 0 ? parseInt(doctor.yearsOfExperience) : 0;
      const isAvailable = doctor.isAvailable === true || doctor.isAvailable === 'true';
      const profileLink = doctor.profileLink || `doctor-detail.html?id=${doctor.id || index}`;
      return `
                    <div class="doctor-card" data-doctor-id="${doctor.id || index}">
                        <div class="doctor-image-container">
                            <img src="${img}" alt="${doctorName}" class="doctor-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x500/007bff/ffffff?text=Doctor';">
                        </div>
                        <div class="doctor-info-container">
                            <h3 class="doctor-name" title="${doctorName}">${doctorName}</h3>
                            <p class="doctor-specialty">${specialty}</p>
                            ${specialties ? `<p class="doctor-sub_specialties">${specialties}</p>` : ''}
                            <p class="doctor-hospital">${hospitalLocation}</p>
                            ${experience > 0 ? `<div class="doctor-stats-row"><div class="stat-badge"><i class="fas fa-award"></i><span>${experience}+ Years</span></div></div>` : ''}
                            <div class="availability-indicator ${isAvailable ? 'available' : 'unavailable'}">
                                <i class="fas fa-circle"></i><span>${isAvailable ? 'Available' : 'Unavailable'}</span>
                            </div>
                            <div class="doctor-actions">
                                <button class="btn-primary" onclick="bookDoctor('${doctorName.replace(/'/g, "\\'")}', '${specialty.replace(/'/g, "\\'")}', ${doctor.id || index})" title="Book appointment with ${doctorName}">
                                    <i class="fas fa-calendar-plus"></i> Book Now
                                </button>
                                <button class="btn-profile" onclick="window.location.href='${profileLink}'" title="View ${doctorName}'s profile">
                                    <i class="fas fa-user"></i> Profile
                                </button>
                            </div>
                        </div>
                    </div>`;
    }).join('')}
        </div>
    ` : '<div class="empty-state"><p>No doctors available at this time.</p></div>';

    expertsTab.innerHTML = `
        <section class="partners">
            <div class="container">
                ${hospitalsHtml}
                ${doctorsHtml}
            </div>
        </section>
    `;
  }

  generateTabTreatmentCard(treatment, tabId) {
    const uniqueId = `tab-${tabId}-treatment-${treatment.id}`;
    const imageHtml = (treatment.image && treatment.image.trim())
      ? `<div class="tab-treatment-image-wrapper"><div class="tab-treatment-image"><img src="${treatment.image}" alt="${treatment.name}" onerror="this.parentElement.style.display='none';"></div></div>`
      : '';
    const featuresHtml = treatment.features && treatment.features.length > 0
      ? `<div class="tab-treatment-features"><h5>Key Features</h5><ul>${treatment.features.map(feature => `<li>${feature}</li>`).join('')}</ul></div>`
      : '';
    return `
    <div class="tab-treatment-card" id="${uniqueId}">
      <div class="tab-treatment-header">
        <div class="tab-treatment-title">
          <i class="${treatment.icon || 'fas fa-procedures'}"></i>
          <span>${treatment.name || 'Treatment'}</span>
        </div>
        <div class="tab-treatment-toggle">
          <i class="fas fa-plus"></i>
          <i class="fas fa-minus"></i>
        </div>
      </div>
      <div class="tab-treatment-body">
        <div class="tab-treatment-wrapper">
          <div class="tab-treatment-content">
            <h4>${treatment.aboutTitle || treatment.name}</h4>
            <p>${treatment.aboutDescription || ''}</p>
            ${treatment.additionalDescription ? `<p class="additional">${treatment.additionalDescription}</p>` : ''}
          </div>
          ${featuresHtml}
          ${imageHtml}
        </div>
      </div>
    </div>`;
  }

  generateCollapsibleTabHTML(tab) {
    const imageHtml = (tab.image && tab.image.trim())
      ? `<div class="tab-image-wrapper"><div class="tab-image"><img src="${tab.image}" alt="${tab.contentTitle || tab.title}" onerror="this.parentElement.style.display='none';"></div></div>`
      : '';
    const statsHtml = tab.stats && tab.stats.length > 0
      ? `<div class="tab-stats">${tab.stats.map(stat => `<div class="tab-stat-item"><span class="tab-stat-value">${stat.value || '0'}</span><span class="tab-stat-label">${stat.label || ''}</span></div>`).join('')}</div>`
      : '';
    const innovativeApproachesHtml = tab.innovativeApproaches && tab.innovativeApproaches.length > 0
      ? `<div class="innovative-approaches"><h4>${tab.innovativeApproachesTitle || 'Innovative Approaches'}</h4><ul class="approaches-list">${tab.innovativeApproaches.map(approach => `<li>${approach}</li>`).join('')}</ul></div>`
      : '';
    const tabTreatmentsHtml = tab.tabTreatments && tab.tabTreatments.length > 0
      ? `<div class="tab-treatments-section"><h3 class="tab-treatments-title">Available Treatment Options</h3><div class="tab-treatments-grid">${tab.tabTreatments.map(treatment => this.generateTabTreatmentCard(treatment, tab.id)).join('')}</div></div>`
      : '';
    return `
    <div class="collapsible-tab">
      <div class="collapsible-tab-header">
        <h2 class="collapsible-tab-title">${tab.title || 'Information'}</h2>
        <i class="fas fa-chevron-down collapsible-tab-icon"></i>
      </div>
      <div class="collapsible-tab-content">
        <div class="tab-content-wrapper">
          <div class="tab-content-text">
            <h3>${tab.contentTitle || ''}</h3>
            <p>${tab.contentDescription || ''}</p>
            ${tab.additionalDescription ? `<div class="additional-desc">${tab.additionalDescription}</div>` : ''}
          </div>
          ${statsHtml}
          ${imageHtml}
          ${innovativeApproachesHtml}
        </div>
        ${tabTreatmentsHtml}
      </div>
    </div>`;
  }

  generateDepartmentContent(dept) {
    const treatments = dept.treatments || [];
    const symptoms = dept.symptoms || [];
    const stats = dept.stats || [];
    const collapsibleTabs = dept.collapsibleTabs || [];
    const aboutParagraphs = dept.aboutParagraphs || [];

    let mainImageHtml = '';
    if (dept.mainImage && dept.mainImage.trim()) {
      mainImageHtml = `<div class="disease-image"><img src="${dept.mainImage}" alt="${dept.title || dept.name}" onerror="this.parentElement.style.display='none';"></div>`;
    } else if (treatments.length > 0 && treatments[0].image && treatments[0].image.trim()) {
      mainImageHtml = `<div class="disease-image"><img src="${treatments[0].image}" alt="${dept.title || dept.name}" onerror="this.parentElement.style.display='none';"></div>`;
    }

    return `
      <div class="disease-header">
        <div class="disease-header-content">
          <h2>${dept.title || dept.name || 'Department'}</h2>
          <p>${dept.subtitle || ''}</p>
        </div>
      </div>
      <div class="content-grid">
        <div class="fade-in-left">
          <div class="info-section">
            <h3>${dept.aboutTitle || 'About ' + (dept.name || 'This Department')}</h3>
            <p>${dept.aboutContent || 'Information about this department will be available soon.'}</p>
            ${aboutParagraphs.length > 0 ? `<div class="about-paragraphs">${aboutParagraphs.map(para => `<p>${para}</p>`).join('')}</div>` : ''}
          </div>
          ${symptoms.length > 0 ? `
          <div class="info-section">
            <h3>Common Symptoms</h3>
            <ul class="symptoms-list">${symptoms.map(symptom => `<li>${symptom}</li>`).join('')}</ul>
          </div>` : ''}
        </div>
        <div class="fade-in-right">
          ${mainImageHtml}
          ${treatments.length > 0 ? `
          <div class="info-section">
            <h3>Treatment Options</h3>
            <p>Click on each treatment option to learn more about our specialized approaches:</p>
            <div class="treatment-options">
              ${treatments.map(treatment => this.generateTreatmentDropdown(treatment)).join('')}
            </div>
          </div>` : ''}
        </div>
      </div>
      ${collapsibleTabs.length > 0 ? `
      <div class="collapsible-tabs">
        ${collapsibleTabs.map(tab => this.generateCollapsibleTabHTML(tab)).join('')}
      </div>` : ''}
      ${stats.length > 0 ? `
      <div class="stats-container">
        ${stats.map(stat => `<div class="stat-item"><div class="stat-value">${stat.value || '0'}</div><div class="stat-label">${stat.label || ''}</div></div>`).join('')}
      </div>` : ''}
      <div class="consultation-cta animate-on-scroll">
        <h3>Need Professional Advice?</h3>
        <p>Our ${dept.name || 'department'} specialists are ready to help you with diagnosis and treatment options.</p>
        <a href="#" class="cta-button dept-booking-btn" data-dept-name="${dept.name || 'General'}" data-dept-id="${dept.id || dept.slug || ''}">Book Consultation</a>
      </div>`;
  }

  generateTreatmentDropdown(t) {
    const imageHtml = (t.image && t.image.trim()) ? `<div class="treatment-image"><img src="${t.image}" alt="${t.name}" onerror="this.parentElement.style.display='none';"></div>` : '';
    return `
      <div class="treatment-dropdown" id="${t.id}-dropdown">
        <div class="treatment-header">
          <div class="treatment-title"><i class="treatment-icon ${t.icon || 'fas fa-medkit'}"></i>${t.name || 'Treatment'}</div>
          <div class="treatment-arrow"><i class="fas fa-plus"></i><i class="fas fa-minus"></i></div>
        </div>
        <div class="treatment-content">
          <div class="treatment-details">
            <div class="treatment-info">
              <div class="treatment-description">
                <h4>${t.aboutTitle || 'About ' + (t.name || 'Treatment')}</h4>
                <p>${t.aboutDescription || ''}</p>
                ${t.additionalDescription ? `<p>${t.additionalDescription}</p>` : ''}
                ${t.features && t.features.length > 0 ? `<ul class="treatment-features">${t.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
              </div>
            </div>
            ${imageHtml}
          </div>
        </div>
      </div>`;
  }

  renderFeatures() {
    const featuresContainer = document.getElementById('features-container');
    if (!featuresContainer) return;
    const features = this.data.features || [];
    if (features.length === 0) {
      featuresContainer.innerHTML = '<div class="empty-state"><p>Feature information will be available soon.</p></div>';
      return;
    }
    featuresContainer.innerHTML = features.map(feature => `
      <div class="feature">
        <i class="${feature.icon || 'fas fa-check'}"></i>
        <h3>${feature.title || 'Feature'}</h3>
        <p>${feature.description || ''}</p>
      </div>`).join('');
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

  setupEventListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.currentTarget.getAttribute('data-tab');
        this.openTab(e, tabName);
      });
    });

    const hamIcon = document.getElementById('ham-icon');
    if (hamIcon) {
      hamIcon.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) navMenu.classList.toggle('active');
      });
    }

    document.addEventListener('click', (e) => {
      const navMenu = document.querySelector('.nav-menu');
      const ham = document.getElementById('ham-icon');
      if (navMenu && ham && navMenu.classList.contains('active') && !navMenu.contains(e.target) && !ham.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });

    const testimonialsContainer = document.getElementById('testimonialsContainer');
    if (testimonialsContainer) {
      testimonialsContainer.addEventListener('mouseenter', () => this.testimonialsModule.stopAutoRotate());
      testimonialsContainer.addEventListener('mouseleave', () => this.testimonialsModule.startAutoRotate());
    }
  }

  initAnimations() {
    function isInView(el) {
      const r = el.getBoundingClientRect();
      return r.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 && r.bottom >= 0;
    }
    function onScroll() {
      const elements = document.querySelectorAll('.animate-on-scroll, .fade-in-left, .fade-in-right, .scale-in, .stagger-animation');
      elements.forEach(el => { if (isInView(el)) el.classList.add('animated'); });
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
  }

  openTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(tabName);
    if (target) target.classList.add("active");
    if (evt?.currentTarget) evt.currentTarget.classList.add("active");
  }

  openVerticalTab(tabId) {
    document.querySelectorAll('.department-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.vertical-tab').forEach(t => { t.classList.remove('active'); t.classList.add('inactive'); });
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    const clicked = document.querySelector(`[data-dept="${tabId}"]`);
    if (clicked) { clicked.classList.add('active'); clicked.classList.remove('inactive'); }
    document.querySelectorAll('.collapsible-tab-header').forEach(h => { h.classList.remove('active'); h.nextElementSibling?.classList.remove('active'); });
    document.querySelectorAll('.treatment-dropdown').forEach(d => { d.classList.remove('active'); d.querySelector('.treatment-content')?.classList.remove('active'); });
  }


  toggleTreatmentDropdown(id) {
    const dd = document.getElementById(id);
    if (!dd) return;


    document.querySelectorAll('.treatment-dropdown').forEach(d => {
      if (d.id !== id) {
        d.classList.remove('active');
        const content = d.querySelector('.treatment-content');
        if (content) {
          content.classList.remove('active');
          setMaxHeight(content, false);
        }
      }
    });


    const isActive = dd.classList.contains('active');
    dd.classList.toggle('active');
    const content = dd.querySelector('.treatment-content');
    if (content) {
      content.classList.toggle('active');
      setMaxHeight(content, !isActive);
    }


    if (!isActive) {
      setTimeout(() => {
        const headerHeight = document.querySelector('.glass-header')?.offsetHeight || 0;
        const ddRect = dd.getBoundingClientRect();

        if (ddRect.top < headerHeight) {
          window.scrollTo({
            top: window.pageYOffset + ddRect.top - headerHeight - 20,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }

  getData() { return this.data; }
  getErrors() { return this.errors; }
  destroy() { if (this.testimonialsModule) this.testimonialsModule.destroy(); }
}


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = button.getAttribute('data-tab');
      document.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
});

let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  app = new MedicalDepartmentsApp(API_CONFIG, STATIC_DATA);
  app.init();
  window.app = app;
  window.appDebug = {
    getData: () => app.getData(),
    getErrors: () => app.getErrors(),
    testimonials: () => app.testimonialsModule
  };
}