
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



function showNotification(message) {

    let notification = document.getElementById('languageNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'languageNotification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #00a1ab, #008a93);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 161, 171, 0.4);
            z-index: 10001;
            opacity: 0;
            transform: translateX(400px);
            transition: all 0.3s ease;
            font-weight: 600;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;


    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);


    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}


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



window.addEventListener('scroll', function () {
    const header = document.querySelector('.glass-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});



const typingText = document.querySelector('.typing-text');
if (typingText) {
    const words = ['Wellness Begins', 'Better Health', 'Quality Care', 'New Life'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 50 : 100);
        }
    }

    setTimeout(type, 1000);
}



function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            animateValue(entry.target, 0, target, 2000);
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});



function openWhatsAppChat() {
    const phoneNumber = '9779708095535';
    const message = 'Hello! I would like to inquire about medical tourism services.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function openWhatsAppMenu() {
    openWhatsAppChat();
}



function toggleAIChat() {
    const chatbot = document.getElementById('aiChatbot');
    const toggleBtn = document.querySelector('.chatbot-toggle');

    if (chatbot.classList.contains('active')) {
        closeAIChat();
    } else {
        openAIChat();
    }
}

function openAIChat() {
    const chatbot = document.getElementById('aiChatbot');
    const toggleBtn = document.querySelector('.chatbot-toggle');
    chatbot.classList.add('active');
    if (toggleBtn) {
        toggleBtn.classList.add('active');
    }
}

function closeAIChat() {
    const chatbot = document.getElementById('aiChatbot');
    const toggleBtn = document.querySelector('.chatbot-toggle');
    chatbot.classList.remove('active');
    if (toggleBtn) {
        toggleBtn.classList.remove('active');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        addUserMessage(message);
        input.value = '';

        setTimeout(() => {
            addBotMessage('Thank you for your message! A medical consultant will respond shortly.');
        }, 1000);
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageHTML = `
        <div class="user-message">
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageHTML = `
        <div class="bot-message">
            <div class="message-avatar">
                <img src="./assets/ai-assistant.png" alt="AI">
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendQuickReply(type) {
    const messages = {
        'treatments': 'I would like to know about available treatments',
        'costs': 'Can you provide information about treatment costs?',
        'hospitals': 'I want to learn about hospital options',
        'visa': 'I need help with visa and travel arrangements'
    };

    const message = messages[type] || type;
    addUserMessage(message);

    setTimeout(() => {
        let response = '';
        switch (type) {
            case 'treatments':
                response = 'We offer a wide range of treatments including cardiac surgery, orthopedic procedures, cosmetic surgery, dental care, and more. Would you like specific information about any treatment?';
                break;
            case 'costs':
                response = 'Our treatments typically cost 40-70% less than Western countries. Use our cost calculator to get a personalized estimate for your specific treatment.';
                break;
            case 'hospitals':
                response = 'We partner with 200+ JCI and NABH accredited hospitals worldwide. Which country or specialty are you interested in?';
                break;
            case 'visa':
                response = 'We provide complete visa assistance including document preparation, application support, and medical visa facilitation. Which country are you planning to visit?';
                break;
            default:
                response = 'How can I help you further?';
        }
        addBotMessage(response);
    }, 1000);
}

function attachFile() {
    alert('File attachment feature coming soon!');
}

function toggleVoiceInput() {
    alert('Voice input feature coming soon!');
}



let currentWizardStep = 1;

function openConsultationWizard() {
    const modal = document.getElementById('consultationModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showWizardStep(1);
}

function closeConsultationWizard() {
    const modal = document.getElementById('consultationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentWizardStep = 1;
}

function showWizardStep(step) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(s => s.classList.remove('active'));

    document.querySelector(`.wizard-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    nextBtn.style.display = step === 4 ? 'none' : 'inline-flex';
    submitBtn.style.display = step === 4 ? 'inline-flex' : 'none';

    currentWizardStep = step;
}

function nextWizardStep() {
    if (currentWizardStep < 4) {
        showWizardStep(currentWizardStep + 1);
    }
}

function previousWizardStep() {
    if (currentWizardStep > 1) {
        showWizardStep(currentWizardStep - 1);
    }
}

function submitConsultation() {
    const consent = document.getElementById('wizardConsent');

    if (!consent.checked) {
        alert('Please accept the terms and conditions to continue.');
        return;
    }

    const formData = {

        name: document.getElementById('wizardName')?.value || '',
        email: document.getElementById('wizardEmail')?.value || '',
        phone: document.getElementById('wizardPhone')?.value || '',
        age: document.getElementById('wizardAge')?.value || '',
        gender: document.getElementById('wizardGender')?.value || '',


        treatment: document.getElementById('wizardTreatment')?.value || '',
        condition: document.getElementById('wizardCondition')?.value || '',
        symptoms: document.getElementById('wizardSymptoms')?.value || '',
        medicalHistory: document.getElementById('wizardHistory')?.value || '',
        currentMedications: document.getElementById('wizardMedications')?.value || '',


        country: document.getElementById('wizardCountry')?.value || '',
        budget: document.getElementById('wizardBudget')?.value || '',
        timeline: document.getElementById('wizardTimeline')?.value || '',
        language: document.getElementById('wizardLanguage')?.value || '',
        specialRequirements: document.getElementById('wizardRequirements')?.value || '',


        files: document.getElementById('wizardFiles')?.files || []
    };


    if (!formData.name || !formData.email || !formData.phone || !formData.treatment) {
        alert('Please fill in all required fields: Name, Email, Phone, and Treatment.');
        return;
    }


    const phoneNumber = '9779708095535';

    let message = `🏥 *NEW MEDICAL CONSULTATION REQUEST* 🏥%0A%0A`;


    message += `*Personal Information:*%0A`;
    message += `👤 Name: ${formData.name}%0A`;
    message += `📧 Email: ${formData.email}%0A`;
    message += `📞 Phone: ${formData.phone}%0A`;
    message += `🎂 Age: ${formData.age || 'Not specified'}%0A`;
    message += `⚧ Gender: ${formData.gender || 'Not specified'}%0A%0A`;


    message += `*Medical Information:*%0A`;
    message += `🎯 Desired Treatment: ${formData.treatment}%0A`;
    message += `🩺 Medical Condition: ${formData.condition || 'Not specified'}%0A`;
    message += `🤒 Symptoms: ${formData.symptoms || 'Not specified'}%0A`;
    message += `📋 Medical History: ${formData.medicalHistory || 'Not specified'}%0A`;
    message += `💊 Current Medications: ${formData.currentMedications || 'Not specified'}%0A%0A`;


    message += `*Preferences:*%0A`;
    message += `🌍 Preferred Country: ${formData.country || 'Not specified'}%0A`;
    message += `💰 Budget Range: ${formData.budget || 'Not specified'}%0A`;
    message += `📅 Preferred Timeline: ${formData.timeline || 'Not specified'}%0A`;
    message += `🗣️ Language Preference: ${formData.language || 'Not specified'}%0A`;
    message += `🎯 Special Requirements: ${formData.specialRequirements || 'None'}%0A%0A`;


    if (formData.files.length > 0) {
        message += `📎 Files Attached: ${formData.files.length} file(s)%0A`;
    }

    message += `_This consultation request was submitted through Gods Life Health Care website._`;


    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;


    const userConfirmed = confirm('Thank you for your detailed consultation request! Click OK to send this information to our medical consultant via WhatsApp.');

    if (userConfirmed) {

        closeConsultationWizard();


        window.open(whatsappUrl, '_blank');


        showNotification('Sending your consultation details to WhatsApp...');


        saveConsultationData(formData);
    } else {

        closeConsultationWizard();
        showNotification('Consultation request saved! You can submit it later.');
    }
}


function saveConsultationData(formData) {
    const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
    consultations.push({
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'submitted'
    });
    localStorage.setItem('consultations', JSON.stringify(consultations));
}


function openWhatsAppConsultation() {
    const phoneNumber = '9779708095535';
    const message = 'Hello! I would like to get a medical consultation. Please guide me through the process.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}


function quickConsultation(treatment = '') {
    const phoneNumber = '9779708095535';
    let message = 'Hello! I am interested in medical consultation.';

    if (treatment) {
        message += ` I'm specifically interested in ${treatment}.`;
    }

    message += ' Please provide me with more information.';

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}




function calculateCost() {
    const treatment = document.getElementById('treatmentSelect').value;
    const country = document.getElementById('countrySelect').value;
    const currency = document.getElementById('currencySelect').value;

    if (!treatment || !country) return;

    const costs = {
        kneeReplacement: { usa: 50000, uk: 45000, canada: 40000, australia: 42000, germany: 38000, godsLife: 8000 },
        heartBypass: { usa: 123000, uk: 110000, canada: 100000, australia: 105000, germany: 95000, godsLife: 15000 },
        dentalImplant: { usa: 4500, uk: 4000, canada: 3800, australia: 4200, germany: 3500, godsLife: 1200 },
        cataractSurgery: { usa: 5000, uk: 4500, canada: 4200, australia: 4300, germany: 4000, godsLife: 1500 },
        dentalCleaning: { usa: 200, uk: 180, canada: 170, australia: 190, germany: 160, godsLife: 50 }
    };

    const homeCost = costs[treatment][country];
    const godsLifeCost = costs[treatment].godsLife;
    const savings = homeCost - godsLifeCost;
    const savingsPercent = Math.round((savings / homeCost) * 100);

    document.getElementById('calculatorResults').style.display = 'block';
    document.getElementById('homeCountryPrice').textContent = `$${homeCost.toLocaleString()}`;
    document.getElementById('godsLifePrice').textContent = `$${godsLifeCost.toLocaleString()}`;
    document.getElementById('savingsPercent').textContent = `${savingsPercent}%`;

    const flags = {
        usa: '🇺🇸',
        uk: '🇬🇧',
        canada: '🇨🇦',
        australia: '🇦🇺',
        germany: '🇩🇪'
    };
    document.getElementById('homeCountryFlag').textContent = flags[country];
}

function openCostCalculator() {
    const section = document.getElementById('calculator');
    section.scrollIntoView({ behavior: 'smooth' });
}



function openCurrencyConverter() {
    alert('Currency converter feature coming soon!');
}

function playVideoTour() {
    alert('Video tour feature coming soon!');
}

function viewAllTreatments() {
    window.location.href = 'department.html';
}

function exploreHospitals() {
    window.location.href = 'hospitals.html';
}

function viewAllDoctors() {
    window.location.href = 'doctor.html';
}



document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function () {
        const faqItem = this.parentElement;
        const wasActive = faqItem.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        if (!wasActive) {
            faqItem.classList.add('active');
        }
    });
});


let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-slide');

function showTestimonial(index) {
    testimonials.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function previousTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
}

if (testimonials.length > 0) {
    setInterval(nextTestimonial, 5000);
}



const filterButtons = document.querySelectorAll('.filter-btn');
const treatmentCards = document.querySelectorAll('.treatment-card-3d');

filterButtons.forEach(button => {
    button.addEventListener('click', function () {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        treatmentCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});



const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}



if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
}



function loadTreatments() {
    const treatmentGrid = document.getElementById('treatmentGrid');
    if (!treatmentGrid) return;

    const treatments = [
        {
            name: 'Knee Replacement Surgery',
            cost: 'From $8,000',
            image: './assets/knee.jpeg',
            category: 'orthopedic',
            details: ['Expert surgeons', 'Advanced technology', '5-7 days hospital stay']
        },
        {
            name: 'Heart Bypass Surgery',
            cost: 'From $15,000',
            image: './assets/heart.jpeg',
            category: 'cardiac',
            details: ['World-class cardiologists', 'State-of-art facilities', '10-14 days recovery']
        },
        {
            name: 'Dental Implants',
            cost: 'From $1,200',
            image: './assets/dental.jpeg',
            category: 'dental',
            details: ['Expert dentists', 'Latest technology', '3-5 days treatment']
        },
        {
            name: 'Cosmetic Surgery',
            cost: 'From $3,500',
            image: './assets/cosmetic.jpeg',
            category: 'cosmetic',
            details: ['Board-certified surgeons', 'Natural results', '5-7 days recovery']
        },
        {
            name: 'IVF Treatment',
            cost: 'From $5,000',
            image: './assets/ivf.jpeg',
            category: 'fertility',
            details: ['High success rates', 'Personalized care', 'Complete support']
        },
        {
            name: 'Hip Replacement',
            cost: 'From $9,000',
            image: './assets/hip.jpeg',
            category: 'orthopedic',
            details: ['Minimally invasive', 'Quick recovery', 'Long-lasting results']
        }
    ];

    treatments.forEach(treatment => {
        const card = `
            <div class="treatment-card-3d" data-category="${treatment.category}">
                <div class="card-image">
                    <img src="${treatment.image}" alt="${treatment.name}">
                    <div class="card-overlay">
                        <button class="btn btn-glass" onclick="openConsultationWizard()">
                            <i class="fas fa-info-circle"></i> Learn More
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${treatment.name}</h3>
                    <div class="card-cost">${treatment.cost}</div>
                    <ul class="card-details">
                        ${treatment.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        treatmentGrid.insertAdjacentHTML('beforeend', card);
    });
}

function loadHospitals() {
    const hospitalGrid = document.getElementById('hospitalGrid');
    if (!hospitalGrid) return;

    const hospitals = [
        {
            name: 'Apollo Hospital',
            location: 'New Delhi, India',
            rating: '4.9',
            image: './assets/apollo.jpeg',
            specialties: ['Cardiology', 'Oncology', 'Orthopedics']
        },
        {
            name: 'Bumrungrad Hospital',
            location: 'Bangkok, Thailand',
            rating: '4.8',
            image: './assets/brung.jpeg',
            specialties: ['Cosmetic', 'Dental', 'Wellness']
        },
        {
            name: 'Fortis Hospital',
            location: 'Mumbai, India',
            rating: '4.9',
            image: './assets/fortis.jpeg',
            specialties: ['Neurology', 'Cardiac', 'Transplant']
        },
        {
            name: 'Medanta Hospital',
            location: 'Gurgaon, India',
            rating: '4.8',
            image: './assets/mur.jpeg',
            specialties: ['Multi-specialty', 'Cancer', 'Heart']
        }
    ];

    hospitals.forEach(hospital => {
        const card = `
            <div class="hospital-card-3d">
                <div class="hospital-image">
                    <img src="${hospital.image}" alt="${hospital.name}">
                    <div class="hospital-rating">
                        <i class="fas fa-star"></i> ${hospital.rating}
                    </div>
                </div>
                <div class="hospital-content">
                    <h3>${hospital.name}</h3>
                    <p class="hospital-location">
                        <i class="fas fa-map-marker-alt"></i> ${hospital.location}
                    </p>
                    <div class="hospital-specialties">
                        ${hospital.specialties.map(spec => `<span class="specialty-badge">${spec}</span>`).join('')}
                    </div>
                    <button class="btn btn-primary btn-block" onclick="openConsultationWizard()">
                        View Details <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        hospitalGrid.insertAdjacentHTML('beforeend', card);
    });
}

function loadDoctors() {
    const doctorGrid = document.getElementById('doctorGrid');
    if (!doctorGrid) return;

    const doctors = [
        {
            name: 'Dr. Ram Yadav',
            specialty: 'Cardiac Surgeon',
            experience: '25+ Years',
            patients: '10,000+',
            rating: '4.9',
            image: './assets/yadav.jpg'
        },
        {
            name: 'Dr. Rajiv Patel',
            specialty: 'Orthopedic Surgeon',
            experience: '18+ Years',
            patients: '8,000+',
            rating: '4.8',
            image: './assets/dr patel.jpg'
        },
        {
            name: 'Dr. Sophia Williams',
            specialty: 'Cosmetic Surgeon',
            experience: '20+ Years',
            patients: '12,000+',
            rating: '4.9',
            image: './assets/emily.webp'
        },
        {
            name: 'Dr. Priya Sharma',
            specialty: 'Fertility Specialist',
            experience: '15+ Years',
            patients: '5,000+',
            rating: '4.9',
            image: './assets/prya.png'
        }
    ];

    doctors.forEach(doctor => {
        const card = `
            <div class="doctor-card-modern">
                <div class="doctor-avatar">
                    <img src="${doctor.image}" alt="${doctor.name}">
                    <div class="doctor-status"></div>
                </div>
                <h3>${doctor.name}</h3>
                <span class="doctor-specialty-badge">${doctor.specialty}</span>
                <div class="doctor-info">
                    <p class="info-item"><i class="fas fa-briefcase"></i> ${doctor.experience}</p>
                    <p class="info-item"><i class="fas fa-users"></i> ${doctor.patients} Patients</p>
                </div>
                <div class="doctor-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span>${doctor.rating}</span>
                </div>
                <button class="btn btn-primary btn-block" onclick="openConsultationWizard()">
                    Book Consultation
                </button>
            </div>
        `;
        doctorGrid.insertAdjacentHTML('beforeend', card);
    });
}

let currentSlide = 0;
const testimonialSlider = document.getElementById('testimonialSlider');
const sliderDots = document.getElementById('sliderDots');
const testimonialsData = [
    {
        name: 'John Anderson',
        role: 'Heart Surgery Patient',
        image: './assets/john.jpeg',
        rating: 5,
        text: 'Gods Life Health Care transformed my life. The cardiac surgery I received in India was world-class, and I saved over $100,000 compared to costs in the US. The team handled everything from flights to hospital stays.'
    },
    {
        name: 'Maria Rodriguez',
        role: 'Knee Replacement Patient',
        image: './assets/maria.jpeg',
        rating: 5,
        text: 'I was skeptical at first, but the entire experience exceeded my expectations. The hospital was modern, the doctors were highly qualified, and the care was exceptional. I can walk pain-free now!'
    },
    {
        name: 'David Chen',
        role: 'Dental Implant Patient',
        image: './assets/david.jpeg',
        rating: 5,
        text: 'The dental work I received was outstanding. The facilities were state-of-the-art, and the dentist was incredibly skilled. Plus, I saved 70% on costs. I highly recommend Gods Life Health Care!'
    }
];

function loadTestimonials() {
    testimonialsData.forEach((testimonial, index) => {
        const slide = `
            <div class="testimonial-slide ${index === 0 ? 'active' : ''}">
                <div class="testimonial-content-modern">
                    <div class="testimonial-image">
                        <img src="${testimonial.image}" alt="${testimonial.name}">
                    </div>
                    <div class="testimonial-text">
                        <div class="quote-icon">
                            <i class="fas fa-quote-left"></i>
                        </div>
                        <div class="testimonial-rating">
                            ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                        </div>
                        <p>${testimonial.text}</p>
                        <h4>${testimonial.name}</h4>
                        <p class="testimonial-role">${testimonial.role}</p>
                    </div>
                </div>
            </div>
        `;
        testimonialSlider.insertAdjacentHTML('beforeend', slide);

        const dot = `<div class="dot ${index === 0 ? 'active' : ''}" onclick="showTestimonial(${index})"></div>`;
        sliderDots.insertAdjacentHTML('beforeend', dot);
    });
}

function showTestimonial(index) {
    currentSlide = index;
    updateSlider();
}

function nextTestimonial() {
    currentSlide = (currentSlide + 1) % testimonialsData.length;
    updateSlider();
}

function previousTestimonial() {
    currentSlide = (currentSlide - 1 + testimonialsData.length) % testimonialsData.length;
    updateSlider();
}

function updateSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}


setInterval(nextTestimonial, 5000);


document.addEventListener('DOMContentLoaded', loadTestimonials);
function renderFooter() {
    const footerContent = document.getElementById('footer-content');
    if (!footerContent) return;

    const { company = {}, contact = {}, quickLinks = [], medicalServices = [], social = {} } = STATIC_DATA.footer || {};

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
    </div>
  `;
}


document.addEventListener('DOMContentLoaded', renderFooter);




document.addEventListener('DOMContentLoaded', function () {
    loadTreatments();
    loadHospitals();
    loadDoctors();
    renderFooter();
    loadLanguagePreference();
});