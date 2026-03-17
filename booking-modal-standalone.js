

// Configuration
const BOOKING_CONFIG = {
    whatsappNumber: '9779708095535',
    companyName: 'Gods Life Health Care'
};


class WhatsAppBookingService {
    constructor(config) {
        this.config = config;
    }

    formatBookingMessage(bookingData, contextName, contextType = 'Hospital') {
        return `New Appointment Booking

${contextType}: ${contextName}
Patient: ${bookingData.patient_name}
Email: ${bookingData.patient_email}
Phone: ${bookingData.patient_phone}
${bookingData.patient_age ? `Age: ${bookingData.patient_age}` : ''}
${bookingData.patient_gender ? `Gender: ${bookingData.patient_gender}` : ''}

Preferred Date: ${bookingData.preferred_date}
Preferred Time: ${bookingData.preferred_time}

${bookingData.specialization ? `Specialization: ${bookingData.specialization}` : ''}
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

    sendBooking(bookingData, contextName, contextType = 'Hospital') {
        const message = this.formatBookingMessage(bookingData, contextName, contextType);
        this.sendToWhatsApp(this.config.whatsappNumber, message);
    }
}


class UniversalBookingModal {
    constructor(config) {
        this.config = config;
        this.whatsappService = new WhatsAppBookingService(config);
        this.modal = null;
        this.contextData = {};
    }

    open(options = {}) {
        this.contextData = {
            name: options.name || 'General Consultation',
            type: options.type || 'Hospital',
            specialization: options.specialization || '',
            id: options.id || null
        };

        this.render();
        this.show();
        this.setupEventListeners();
    }

    render() {
        const existing = document.getElementById('universalBookingModal');
        if (existing) existing.remove();

        const modalHTML = `
            <div id="universalBookingModal" class="modal booking-modal">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeUniversalBooking()">&times;</span>
                    
                    <div class="booking-card__header">
                        <h3 class="booking-card__title">Book Appointment</h3>
                        <p class="booking-card__subtitle">
                            ${this.contextData.type}: ${this.contextData.name}
                        </p>
                        ${this.contextData.specialization ? `<p class="booking-card__specialty">
                            <i class="fas fa-stethoscope"></i> ${this.contextData.specialization}
                        </p>` : ''}
                    </div>

                    <div class="booking-card__body">
                        <form id="universalBookingForm">
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
                                <label>Message / Medical Concern</label>
                                <textarea name="message" rows="3" placeholder="Describe your medical concern or requirements"></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="closeUniversalBooking()">
                                    Cancel
                                </button>
                                <button type="submit" class="btn-modal-submit">
                                    <i class="fab fa-whatsapp"></i> Send via WhatsApp
                                </button>
                            </div>
                        </form>

                        <div id="universalBookingResult" class="booking-result"></div>
                    </div>

                    <div class="booking-card__footer">
                        <i class="fas fa-shield-alt"></i> Secure booking via WhatsApp
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('universalBookingModal');
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
            setTimeout(() => {
                if (this.modal) this.modal.remove();
            }, 300);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('universalBookingForm');
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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                this.hide();
            }
        });
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
            message: formData.get('message') || '',
            specialization: this.contextData.specialization
        };

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening WhatsApp...';

            this.whatsappService.sendBooking(
                bookingData,
                this.contextData.name,
                this.contextData.type
            );

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showResult('success', `
                <strong>✓ WhatsApp Opening...</strong>
                <p>Review and send the booking message in WhatsApp.</p>
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
        const resultDiv = document.getElementById('universalBookingResult');
        if (resultDiv) {
            resultDiv.className = `booking-result ${type} show`;
            resultDiv.innerHTML = message;
        }
    }
}


let universalBookingModal = null;

function initUniversalBooking() {
    if (!universalBookingModal) {
        universalBookingModal = new UniversalBookingModal(BOOKING_CONFIG);
    }
}



/**
 * Open booking for hospital
 * @param {string} hospitalName - Name of the hospital
 * @param {string} hospitalSlug - Slug or ID of the hospital
 */
function bookHospital(hospitalName, hospitalSlug = null) {
    initUniversalBooking();
    universalBookingModal.open({
        name: hospitalName,
        type: 'Hospital',
        id: hospitalSlug
    });
}

/**
 * UPDATED: Open booking for doctor (now accepts 3 parameters)
 * @param {string} doctorName - Name of the doctor
 * @param {string} specialization - Doctor's specialization
 * @param {number|string} doctorId - Doctor's ID (optional)
 */
function bookDoctor(doctorName, specialization = '', doctorId = null) {
    initUniversalBooking();
    universalBookingModal.open({
        name: doctorName,
        type: 'Doctor',
        specialization: specialization,
        id: doctorId
    });
}

/**
 * Open general consultation booking
 */
function bookConsultation() {
    initUniversalBooking();
    universalBookingModal.open({
        name: 'General Consultation',
        type: 'Consultation'
    });
}

/**
 * Book consultation for specific department
 * @param {string} deptName - Department name
 * @param {string} deptId - Department ID/slug
 */
function bookDepartmentConsultation(deptName, deptId = null) {
    initUniversalBooking();
    universalBookingModal.open({
        name: `${deptName} Department`,
        type: 'Department',
        specialization: deptName,
        id: deptId
    });
}

/**
 * Open custom booking
 * @param {Object} options - Booking options
 */
function bookCustom(options) {
    initUniversalBooking();
    universalBookingModal.open(options);
}

/**
 * Close booking modal
 */
function closeUniversalBooking() {
    if (universalBookingModal) {
        universalBookingModal.hide();
    }
}


function setupBookingEventListeners() {
    document.addEventListener('click', function (e) {
        // Handle department booking buttons
        if (e.target.classList.contains('dept-booking-btn')) {
            e.preventDefault();
            const deptName = e.target.getAttribute('data-dept-name') || 'General';
            const deptId = e.target.getAttribute('data-dept-id') || '';
            bookDepartmentConsultation(deptName, deptId);
        }

        // Handle general consultation buttons
        if (e.target.classList.contains('cta-button') && !e.target.classList.contains('dept-booking-btn')) {
            e.preventDefault();
            bookConsultation();
        }
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initUniversalBooking();
        setupBookingEventListeners();
    });
} else {
    initUniversalBooking();
    setupBookingEventListeners();
}

// Export for module usage (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        bookHospital,
        bookDoctor,
        bookConsultation,
        bookDepartmentConsultation,
        bookCustom,
        closeUniversalBooking
    };
}