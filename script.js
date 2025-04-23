// script.js
// Smooth scroll for nav links
const links = document.querySelectorAll('header.hero nav a');
links.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});