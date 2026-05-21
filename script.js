// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Smooth Scroll
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// FAQ Toggle
function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const isActive = button.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.classList.remove('active');
        btn.nextElementSibling.classList.remove('active');
    });
    
    // Toggle current FAQ
    if (!isActive) {
        button.classList.add('active');
        answer.classList.add('active');
    }
}

// Form Submit Handler
function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate phone number
    if (data.phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
        if (!phoneRegex.test(data.phone)) {
            alert('Пожалуйста, введите корректный номер телефона');
            return;
        }
    }
    
    // Validate email if present
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }
    }
    
    // Simulate form submission
    console.log('Form submitted:', formType, data);
    
    // Show success message
    alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
    
    // Reset form and close modal
    form.reset();
    const modal = form.closest('.modal');
    if (modal) {
        closeModal(modal.id);
    }
    
    // Here you would typically send data to your backend or CRM
    // Example: fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) })
}

// Calculator Logic
function calculateLeadCost(event) {
    event.preventDefault();
    
    const niche = document.getElementById('calc-niche').value;
    const budget = parseFloat(document.getElementById('calc-budget').value);
    const region = document.getElementById('calc-region').value;
    const conversion = parseFloat(document.getElementById('calc-conversion').value) || 2.5;
    
    if (!niche || !budget || !region) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // CPC rates by niche (average values for Russia)
    const cpcRates = {
        ecommerce: { moscow: 45, spb: 35, million: 28, region: 22, small: 15 },
        services: { moscow: 55, spb: 42, million: 35, region: 28, small: 18 },
        b2b: { moscow: 120, spb: 95, million: 75, region: 55, small: 35 },
        medicine: { moscow: 85, spb: 65, million: 50, region: 38, small: 25 },
        construction: { moscow: 150, spb: 120, million: 95, region: 70, small: 45 },
        education: { moscow: 65, spb: 50, million: 40, region: 30, small: 20 },
        other: { moscow: 50, spb: 40, million: 32, region: 25, small: 16 }
    };
    
    const baseCpc = cpcRates[niche]?.[region] || 30;
    
    // Calculate metrics
    const clicks = Math.floor(budget / baseCpc);
    const leads = Math.floor(clicks * (conversion / 100));
    const costPerLead = leads > 0 ? Math.round(budget / leads) : 0;
    
    // Display results
    document.getElementById('cpc-value').textContent = `${baseCpc}₽`;
    document.getElementById('clicks-value').textContent = clicks.toLocaleString();
    document.getElementById('leads-value').textContent = leads.toLocaleString();
    document.getElementById('cost-per-lead').textContent = `${costPerLead}₽`;
    
    // Show result section
    document.getElementById('calculator-result').style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('calculator-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add active class to current page nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Add scroll animation for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.service-card, .case-card, .problem-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Phone input mask (simple version)
document.addEventListener('input', (e) => {
    if (e.target.type === 'tel') {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = value.slice(1);
            }
            
            let formatted = '+7';
            if (value.length > 0) formatted += ' (' + value.slice(0, 3);
            if (value.length > 3) formatted += ') ' + value.slice(3, 6);
            if (value.length > 6) formatted += '-' + value.slice(6, 8);
            if (value.length > 8) formatted += '-' + value.slice(8, 10);
            
            e.target.value = formatted;
        }
    }
});
