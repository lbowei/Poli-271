/* Hongjue Denim: site interactions (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Header: solid background after scrolling ---------- */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Reveal on scroll (content stays visible if this never runs) ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // stagger siblings
    revealEls.forEach((el) => {
      const sibs = $$(':scope > [data-reveal]', el.parentElement);
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 0.07}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.documentElement.classList.add('reveal-ready');
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- "Add to inquiry" selections ---------- */
  const KEY = 'hj-picks';
  let picks = [];
  try { picks = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { picks = []; }

  const chips = $('[data-chips]');
  const empty = $('[data-picks-empty]');
  const hidden = $('[data-picks-input]');
  const counts = $$('[data-pick-count]');

  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(picks)); } catch (e) { /* ignore */ } };

  const render = () => {
    $$('[data-pick]').forEach((btn) => {
      const on = picks.includes(btn.dataset.pick);
      btn.setAttribute('aria-pressed', String(on));
      const isWash = btn.classList.contains('pick-light');
      btn.textContent = on ? 'Added' : isWash ? 'Add' : 'Add to inquiry';
      const card = btn.closest('.fit-card');
      if (card) card.classList.toggle('is-picked', on);
    });
    if (chips) {
      chips.innerHTML = '';
      picks.forEach((p) => {
        const li = document.createElement('li');
        li.className = 'chip';
        li.append(document.createTextNode(p));
        const x = document.createElement('button');
        x.type = 'button';
        x.setAttribute('aria-label', `Remove ${p}`);
        x.textContent = '×';
        x.addEventListener('click', () => { picks = picks.filter((q) => q !== p); save(); render(); });
        li.append(x);
        chips.append(li);
      });
    }
    if (empty) empty.hidden = picks.length > 0;
    if (hidden) hidden.value = picks.join('; ');
    counts.forEach((c) => { c.hidden = picks.length === 0; c.textContent = String(picks.length); });
  };

  $$('[data-pick]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const v = btn.dataset.pick;
      picks = picks.includes(v) ? picks.filter((p) => p !== v) : [...picks, v];
      save(); render();
    })
  );
  $$('[data-pick-add]').forEach((a) =>
    a.addEventListener('click', () => {
      const v = a.dataset.pickAdd;
      if (!picks.includes(v)) { picks.push(v); save(); render(); }
    })
  );
  render();

  /* ---------- Inquiry form ---------- */
  const form = $('.quote-form');
  if (form) {
    const status = $('.form-status', form);
    const setStatus = (t, cls = '') => { status.textContent = t; status.className = `form-status ${cls}`.trim(); };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // light validation
      let ok = true;
      $$('input[required]', form).forEach((inp) => {
        const bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
        inp.closest('.field').classList.toggle('is-invalid', bad);
        if (bad && ok) { inp.focus(); ok = false; }
      });
      if (!ok) { setStatus('Please add your name and a valid email.', 'err'); return; }

      const data = new FormData(form);
      if (form.action.includes('YOUR_FORM_ID')) {
        const lines = [];
        data.forEach((v, k) => { if (String(v).trim()) lines.push(`${k}: ${v}`); });
        const subject = `Inquiry from ${data.get('company') || data.get('name') || 'website'}`;
        window.location.href = `mailto:${form.dataset.fallbackEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
        setStatus('Your email app should now open with the inquiry filled in.', 'ok');
        return;
      }

      setStatus('Sending…');
      try {
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        picks = []; save(); render();
        setStatus('Thanks. We got your inquiry and will reply within one business day.', 'ok');
      } catch (err) {
        setStatus('Something went wrong. Please email us directly instead.', 'err');
      }
    });
    $$('input[required]', form).forEach((inp) =>
      inp.addEventListener('input', () => inp.closest('.field').classList.remove('is-invalid'))
    );
  }

  /* ---------- Draft helper ---------- */
  if (document.body.classList.contains('draft')) {
    const pill = $('[data-draft-pill]');
    const n = $$('.tbd').length;
    if (pill && n) {
      $('[data-tbd-count]', pill).textContent = String(n);
      pill.hidden = false;
      const btn = $('[data-tbd-toggle]', pill);
      btn.addEventListener('click', () => {
        const off = document.body.classList.toggle('tbd-off');
        btn.textContent = off ? 'Show markers' : 'Hide markers';
        btn.setAttribute('aria-pressed', String(!off));
      });
    }
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
