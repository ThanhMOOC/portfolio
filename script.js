// script.js
// Smooth scroll for nav links
const links = document.querySelectorAll('header.hero nav a');
links.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const contactBtn = document.getElementById('nav-contact');
  const contactSection = document.getElementById('contact');

  contactBtn.addEventListener('click', function (e) {
    e.preventDefault(); // chặn hành vi mặc định
    contactSection.classList.remove('highlight');
    void contactSection.offsetWidth; // trigger reflow
    contactSection.classList.add('highlight');
  });
});