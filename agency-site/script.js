// Agency Website - Complete JavaScript
document.addEventListener('DOMContentLoaded', function() {

    // ===== Mobile Menu Toggle =====
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking on a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            });
        });
    }

    // ===== Form Handling with Validation =====
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic validation
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--error)';
                    
                    input.addEventListener('input', function() {
                        this.style.borderColor = '';
                    });
                } else {
                    input.style.borderColor = '';
                }

                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        input.style.borderColor = 'var(--error)';
                    }
                }

                if (input.type === 'tel' && input.value) {
                    const phoneDigits = input.value.replace(/\D/g, '');
                    if (phoneDigits.length < 10) {
                        isValid = false;
                        input.style.borderColor = 'var(--error)';
                    }
                }
            });

            if (!isValid) {
                alert('Пожалуйста, заполните все обязательные поля корректно.');
                return;
            }

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            console.log('Form submitted:', data);

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Отправлено! ✓';
            submitBtn.style.background = 'var(--success)';
            submitBtn.disabled = true;

            setTimeout(() => {
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);

            alert('Спасибо! Мы свяжемся с вами в течение рабочего дня.');
        });
    });

    // ===== Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    // ===== FAQ Accordion =====
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                document.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
                item.classList.toggle('active');
            });
        }
    });

    // ===== Calculator =====
    const calcBudget = document.getElementById('calcBudget');
    const calcConversion = document.getElementById('calcConversion');
    const calcAvgCheck = document.getElementById('calcAvgCheck');
    const calcResult = document.getElementById('calcResult');

    if (calcBudget && calcConversion && calcAvgCheck && calcResult) {
        function updateCalc() {
            const budget = parseFloat(calcBudget.value) || 0;
            const conversion = parseFloat(calcConversion.value) || 0;
            const avgCheck = parseFloat(calcAvgCheck.value) || 0;

            if (budget > 0 && conversion > 0 && avgCheck > 0) {
                const avgCPC = 50;
                const clicks = Math.floor(budget / avgCPC);
                const leads = Math.floor(clicks * (conversion / 100));
                const revenue = leads * avgCheck;
                const roi = ((revenue - budget) / budget * 100).toFixed(0);
                calcResult.innerHTML = `<div>Заявок: <strong>${leads}</strong></div><div>Выручка: <strong>${revenue.toLocaleString()} ₽</strong></div><div>ROI: <strong>${roi}%</strong></div>`;
            } else {
                calcResult.innerHTML = 'Заполните все поля';
            }
        }
        calcBudget.addEventListener('input', updateCalc);
        calcConversion.addEventListener('input', updateCalc);
        calcAvgCheck.addEventListener('input', updateCalc);
    }

    // ===== Scroll Animations =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .service-card, .case-card, .form-box, .step').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    console.log('Site initialized!');
});
