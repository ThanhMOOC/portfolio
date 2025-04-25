// script.js
// Smooth scroll for nav links

document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('header.hero nav a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
    // Nếu không bắt đầu bằng # thì là link ra file khác, không ngăn hành vi mặc định
  });

  const contactBtn = document.getElementById('nav-contact');
  const contactSection = document.getElementById('contact');

  if (contactBtn && contactSection) {
    contactBtn.addEventListener('click', function (e) {
      e.preventDefault(); // chặn hành vi mặc định
      contactSection.classList.remove('highlight');
      void contactSection.offsetWidth; // trigger reflow
      contactSection.classList.add('highlight');
    });
  }
});