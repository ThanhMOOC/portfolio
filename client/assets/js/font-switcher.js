/**
 * Font Switcher Module
 * Adds a dropdown in the nav bar to switch between retro fonts.
 * The selected font is persisted in localStorage and applied to the full page.
 */

const STORAGE_KEY = 'portfolio-retro-font';

const FONTS = [
  { label: 'Default (Josefin Sans)', value: '' },
  { label: 'CHI SON 1',    value: 'SG85-CHI SON 1' },
  { label: 'CHI SON 2',    value: 'SG85-CHI SON 2' },
  { label: 'HIEN KHANH 1', value: 'SG85-HIEN KHANH 1' },
  { label: 'HIEN KHANH 2', value: 'SG85-HIEN KHANH 2' },
  { label: 'HIEN KHANH 3', value: 'SG85-HIEN KHANH 3' },
  { label: 'HONG KY 1',    value: 'SG85-HONG KY 1' },
  { label: 'HONG KY 2',    value: 'SG85-HONG KY 2' },
  { label: 'PHAT TAI',     value: 'SG85-PHAT TAI' },
  { label: 'SAIGON 1985',  value: 'SG85-Saigon 1985' },
  { label: 'CUA HANG',     value: 'SG85-CUA HANG' },
];

class FontSwitcher {
  constructor() {
    this.currentFont = localStorage.getItem(STORAGE_KEY) ?? '';
    this.isOpen      = false;
    this.btn         = null;
    this.dropdown    = null;

    this.#buildButton();
    this.#buildDropdown();
    this.#applyFont(this.currentFont, false); // restore on load (no save needed)
    this.#setupOutsideClick();
    this.#setupReposition();
  }

  // ─── Font application ────────────────────────────────────────────────────

  #applyFont(value, save = true) {
    document.body.style.fontFamily = value
      ? `'${value}', 'Josefin Sans', Arial, sans-serif`
      : '';

    this.currentFont = value;
    if (save) localStorage.setItem(STORAGE_KEY, value);
    this.#updateActiveItem();
  }

  // ─── Build UI ─────────────────────────────────────────────────────────────

  #buildButton() {
    const nav = document.querySelector('.main-navigation nav');
    if (!nav) return;

    // Visual separator
    const sep = document.createElement('span');
    sep.className = 'font-switcher-sep';
    nav.appendChild(sep);

    // Toggle button
    const btn = document.createElement('button');
    btn.className  = 'font-switcher-btn';
    btn.type       = 'button';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label',    'Change font');
    btn.title      = 'Change font';
    btn.innerHTML  = '<span class="font-switcher-btn__label">Aa</span>'
                   + '<span class="font-switcher-btn__chevron" aria-hidden="true"></span>';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.#toggle();
    });

    nav.appendChild(btn);
    this.btn = btn;
  }

  #buildDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'font-switcher-dropdown';
    dropdown.setAttribute('role',       'listbox');
    dropdown.setAttribute('aria-label', 'Select font');

    FONTS.forEach(({ label, value }) => {
      const item = document.createElement('button');
      item.className = 'font-switcher-dropdown__item';
      item.type      = 'button';
      item.setAttribute('role',      'option');
      item.dataset.fontValue = value;

      // "Aa" preview in the font itself
      const preview = document.createElement('span');
      preview.className   = 'font-switcher-dropdown__preview';
      preview.textContent = 'Aa';
      if (value) preview.style.fontFamily = `'${value}', sans-serif`;

      // Readable name always in Josefin Sans
      const name = document.createElement('span');
      name.className   = 'font-switcher-dropdown__name';
      name.textContent = label;

      item.appendChild(preview);
      item.appendChild(name);

      item.addEventListener('click', () => {
        this.#applyFont(value);
        this.#close();
      });

      dropdown.appendChild(item);
    });

    // Append to body so it is never clipped by nav's overflow:hidden
    document.body.appendChild(dropdown);
    this.dropdown = dropdown;
    this.#updateActiveItem();
  }

  // ─── Dropdown open / close ────────────────────────────────────────────────

  #toggle() {
    this.isOpen ? this.#close() : this.#open();
  }

  #open() {
    this.isOpen = true;
    this.#position();
    this.dropdown.classList.add('is-open');
    this.btn.classList.add('is-active');
    this.btn.setAttribute('aria-expanded', 'true');
  }

  #close() {
    this.isOpen = false;
    this.dropdown.classList.remove('is-open');
    this.btn.classList.remove('is-active');
    this.btn.setAttribute('aria-expanded', 'false');
  }

  // ─── Positioning ──────────────────────────────────────────────────────────

  #position() {
    const rect   = this.btn.getBoundingClientRect();
    const width  = 230;
    const gap    = 10;

    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    this.dropdown.style.top   = `${rect.bottom + gap}px`;
    this.dropdown.style.left  = `${left}px`;
    this.dropdown.style.width = `${width}px`;
  }

  // ─── Active state ─────────────────────────────────────────────────────────

  #updateActiveItem() {
    if (!this.dropdown) return;
    this.dropdown.querySelectorAll('.font-switcher-dropdown__item').forEach(el => {
      el.classList.toggle('is-active', el.dataset.fontValue === this.currentFont);
      el.setAttribute('aria-selected', el.dataset.fontValue === this.currentFont ? 'true' : 'false');
    });
  }

  // ─── Event listeners ──────────────────────────────────────────────────────

  #setupOutsideClick() {
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.dropdown.contains(e.target) && e.target !== this.btn) {
        this.#close();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.#close();
    });
  }

  #setupReposition() {
    window.addEventListener('scroll', () => { if (this.isOpen) this.#position(); }, { passive: true });
    window.addEventListener('resize', () => { if (this.isOpen) this.#position(); });
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const initFontSwitcher = () => new FontSwitcher();

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initFontSwitcher)
  : initFontSwitcher();
