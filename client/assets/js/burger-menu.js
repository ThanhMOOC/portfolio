// Burger menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const burgerMenu = document.getElementById('burger-menu');
  const burgerOverlay = document.getElementById('burger-overlay');

  burgerMenu.addEventListener('click', function() {
    burgerOverlay.classList.toggle('active');
    burgerMenu.classList.toggle('active');
  });

  burgerOverlay.addEventListener('click', function(e) {
    if (e.target === burgerOverlay) {
      burgerOverlay.classList.remove('active');
      burgerMenu.classList.remove('active');
    }
  });
});