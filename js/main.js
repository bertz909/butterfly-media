// ========== SCROLL REVEAL ==========
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

// ========== SMOOTH SCROLL & MOBILE MENU CLOSE ==========
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-links a[href^="#"]');
  if (link) {
    document.querySelector('.nav-links').classList.remove('open');
  }
});

// ========== NAV SCROLL EFFECT ==========
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  const scrollY = window.scrollY;
  if (scrollY > 100) {
    nav.style.borderBottomColor = 'var(--border-light)';
  } else {
    nav.style.borderBottomColor = 'var(--border-subtle)';
  }
  lastScroll = scrollY;
});

// ========== PORTFOLIO EXPAND/COLLAPSE ==========
function togglePortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const btn = document.getElementById('portfolio-toggle');
  const lang = document.documentElement.dataset.lang || 'en';
  const expanded = grid.classList.toggle('expanded');

  if (expanded) {
    btn.innerHTML = lang === 'it' ? 'Mostra Meno &#8593;' : 'Show Less &#8593;';
    // Trigger reveal on newly visible items
    grid.querySelectorAll('.portfolio-hidden.reveal:not(.visible)').forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    btn.innerHTML = lang === 'it' ? 'Mostra Tutti &#8595;' : 'Show More &#8595;';
    // Scroll back to portfolio section
    document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
  }
}

// ========== CONTACT FORM ==========
// Uses Formspree, Getform, or similar. Replace the endpoint.
const FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/YOUR_ID'

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.form-submit');
  const status = document.getElementById('form-status');
  const lang = document.documentElement.dataset.lang || 'en';

  // Honeypot anti-spam check
  const honeypot = form.querySelector('[name="website"]');
  if (honeypot && honeypot.value) {
    status.className = 'form-status error';
    const t = translations || {};
    status.textContent = (t[lang] && t[lang]['contact.form.spam']) || 'Spam detected.';
    return false;
  }

  // If no endpoint configured, use mailto fallback
  if (!FORM_ENDPOINT) {
    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const company = data.get('company');
    const service = data.get('service');
    const message = data.get('message');

    const subject = encodeURIComponent(`[Butterfly Media] New inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nService: ${service || 'N/A'}\n\n${message}`
    );
    window.location.href = `mailto:nicola.bertato@gmail.com?subject=${subject}&body=${body}`;

    status.className = 'form-status success';
    status.textContent = lang === 'it'
      ? 'Si aprirà il tuo client email. Grazie!'
      : 'Your email client will open. Thank you!';
    return false;
  }

  btn.disabled = true;
  btn.textContent = lang === 'it' ? 'Invio in corso...' : 'Sending...';

  fetch(FORM_ENDPOINT, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  })
  .then(res => {
    if (res.ok) {
      status.className = 'form-status success';
      const t = translations || {};
      status.textContent = (t[lang] && t[lang]['contact.form.success']) || 'Message sent!';
      form.reset();
    } else {
      throw new Error('Form submission failed');
    }
  })
  .catch(() => {
    status.className = 'form-status error';
    const t = translations || {};
    status.textContent = (t[lang] && t[lang]['contact.form.error']) || 'Something went wrong.';
  })
  .finally(() => {
    btn.disabled = false;
    const t = translations || {};
    btn.textContent = (t[lang] && t[lang]['contact.form.send']) || 'Send Message \u2192';
  });

  return false;
}