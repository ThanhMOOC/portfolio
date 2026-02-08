/**
 * Contact Form Handler
 * Handles form submission UI states (loading, success, error)
 */

export function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = contactForm.querySelector('button');
    const originalText = btn.innerHTML;

    const setButtonState = ({ html, background, borderColor, opacity, disabled }) => {
      if (html !== undefined) btn.innerHTML = html;
      if (background !== undefined) btn.style.background = background;
      if (borderColor !== undefined) btn.style.borderColor = borderColor;
      if (opacity !== undefined) btn.style.opacity = opacity;
      if (disabled !== undefined) btn.disabled = disabled;
    };
    
    // 1. UI Loading state
    setButtonState({
      html: '<i class="fas fa-spinner fa-spin"></i> Sending...',
      opacity: '0.8',
      disabled: true
    });
    
    try {
      // Simulate network request (Replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. Success state
      // Use styles that match the success theme
      setButtonState({
        html: '<i class="fas fa-check"></i> Sent Successfully!',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        borderColor: '#22c55e'
      });
      
      contactForm.reset();
      
    } catch (error) {
      // Error state (optional implementation)
      console.error('Submission error:', error);
      setButtonState({
        html: '<i class="fas fa-exclamation-circle"></i> Error',
        background: 'red'
      });
    } finally {
      // 3. Reset button state after delay
      setTimeout(() => {
        setButtonState({
          html: originalText,
          background: '',
          borderColor: '',
          opacity: '1',
          disabled: false
        });
      }, 3000);
    }
  });
}