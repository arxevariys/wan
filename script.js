/**
 * LeadGenerator - Main JavaScript
 * Handles: mobile menu, modals, form validation, smooth scroll, animations
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // Mobile Menu Toggle
    // ========================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // Update ARIA attribute
            const isExpanded = this.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking on a link
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }
    
    // ========================================
    // Modal Functionality
    // ========================================
    const openModalButtons = document.querySelectorAll('.open-modal');
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // Open modal
    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Focus first input in modal for accessibility
                const firstInput = modal.querySelector('input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        });
    });
    
    // Close modal functions
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the button that opened the modal
        const openedBy = document.querySelector('[data-modal="' + modal.id + '"]');
        if (openedBy) {
            openedBy.focus();
        }
    }
    
    // Close on close button click
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close on overlay click
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
    
    // ========================================
    // Form Validation & Submission
    // ========================================
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                const value = field.value.trim();
                
                // Remove previous error states
                field.classList.remove('error');
                const errorDiv = field.parentElement.querySelector('.form-error');
                if (errorDiv) errorDiv.remove();
                
                // Validate based on field type
                if (!value) {
                    isValid = false;
                    showFieldError(field, 'Это поле обязательно для заполнения');
                } else if (field.type === 'email' && !isValidEmail(value)) {
                    isValid = false;
                    showFieldError(field, 'Введите корректный email');
                } else if (field.type === 'tel' && !isValidPhone(value)) {
                    isValid = false;
                    showFieldError(field, 'Введите корректный номер телефона');
                } else if (field.type === 'url' && value && !isValidUrl(value)) {
                    isValid = false;
                    showFieldError(field, 'Введите корректный URL сайта');
                }
            });
            
            if (isValid) {
                // Simulate form submission
                const submitButton = form.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.disabled = true;
                submitButton.textContent = 'Отправка...';
                
                // Here you would normally send data to your backend/CRM
                // For demo purposes, we'll simulate a successful submission
                setTimeout(() => {
                    showSuccessMessage(form);
                    form.reset();
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    
                    // Close modal if form is inside one
                    const modal = form.closest('.modal');
                    if (modal) {
                        closeModal(modal);
                    }
                }, 1500);
            }
        });
        
        // Real-time validation on blur
        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Clear error on input
            field.addEventListener('input', function() {
                const errorDiv = this.parentElement.querySelector('.form-error');
                if (errorDiv && this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const errorDiv = field.parentElement.querySelector('.form-error');
        
        if (!value && field.hasAttribute('required')) {
            showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        } else if (field.type === 'email' && value && !isValidEmail(value)) {
            showFieldError(field, 'Введите корректный email');
            return false;
        } else if (field.type === 'tel' && value && !isValidPhone(value)) {
            showFieldError(field, 'Введите корректный номер телефона');
            return false;
        } else if (field.type === 'url' && value && !isValidUrl(value)) {
            showFieldError(field, 'Введите корректный URL сайта');
            return false;
        } else {
            if (errorDiv) errorDiv.remove();
            field.classList.remove('error');
            return true;
        }
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;';
        
        field.parentElement.appendChild(errorDiv);
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', 'form-error');
    }
    
    function showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #10b981;">Заявка отправлена!</h3>
                <p style="color: #64748b;">Мы свяжемся с вами в течение 24 часов.</p>
            </div>
        `;
        
        form.innerHTML = '';
        form.appendChild(successDiv);
    }
    
    // ========================================
    // Validation Helper Functions
    // ========================================
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        // Remove all non-digit characters except +
        const cleaned = phone.replace(/[^\d+]/g, '');
        // Check if it has at least 10 digits (including country code)
        const digitCount = cleaned.replace(/\D/g, '').length;
        return digitCount >= 10 && digitCount <= 15;
    }
    
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                    mobileMenuBtn.click();
                }
            }
        });
    });
    
    // ========================================
    // Header Scroll Effect
    // ========================================
    const header = document.querySelector('.header');
    
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = 'var(--shadow-md)';
            } else {
                header.style.boxShadow = 'var(--shadow-sm)';
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // ========================================
    // FAQ Accordion Enhancement
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            // Close other items when one is opened (optional accordion behavior)
            if (this.open) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== this && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
    
    // ========================================
    // Intersection Observer for Animations
    // ========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.pain-card, .service-card, .case-card, .process-step, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add animate-in styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // ========================================
    // Phone Input Mask (Simple Implementation)
    // ========================================
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                // Add country code if not present
                if (!value.startsWith('7') && !value.startsWith('8')) {
                    value = '7' + value;
                }
                
                // Format: +7 (XXX) XXX-XX-XX
                if (value.length > 1) {
                    value = '+7 (' + value.slice(1, 4);
                }
                if (value.length > 7) {
                    value = value.slice(0, 7) + ') ' + value.slice(7, 10);
                }
                if (value.length > 11) {
                    value = value.slice(0, 11) + '-' + value.slice(11, 13);
                }
                if (value.length > 14) {
                    value = value.slice(0, 14) + '-' + value.slice(14, 16);
                }
            }
            
            e.target.value = value;
        });
    });
    
    // ========================================
    // Track CTA Clicks (for Analytics)
    // ========================================
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(button => {
        button.addEventListener('click', function() {
            // You can integrate with Google Analytics, Yandex Metrica, etc.
            // Example: gtag('event', 'click', { event_category: 'CTA', event_label: this.textContent });
            console.log('CTA clicked:', this.textContent.trim());
        });
    });
    
    // ========================================
    // Lazy Load Images (if any are added later)
    // ========================================
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
    
    console.log('LeadGenerator site initialized successfully! 🚀');
});
