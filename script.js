const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const form = document.getElementById('lead-form');
const message = document.querySelector('.form-message');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim();

  message.textContent = name
    ? `Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`
    : 'Спасибо! Мы свяжемся с вами в ближайшее время.';

  form.reset();
});
