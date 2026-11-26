// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// Quote form: posts to Formspree when configured; otherwise opens an email draft.
const form = document.querySelector('.quote-form');
if (form) {
  const status = form.querySelector('.form-status');
  const setStatus = (text, cls) => {
    status.textContent = text;
    status.className = 'form-status' + (cls ? ' ' + cls : '');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    if (form.action.includes('YOUR_FORM_ID')) {
      const lines = [];
      data.forEach((value, key) => { if (value) lines.push(`${key}: ${value}`); });
      const to = form.dataset.fallbackEmail || '';
      const subject = `Inquiry from ${data.get('company') || data.get('name') || 'website'}`;
      window.location.href =
        `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      setStatus('Your email app should now open with the inquiry filled in.', 'ok');
      return;
    }

    setStatus('Sending…');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus('Thanks. We got your inquiry and will reply within one business day.', 'ok');
    } catch (err) {
      setStatus('Something went wrong. Please email us directly instead.', 'err');
    }
  });
}
