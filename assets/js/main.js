/* SP International — shared site behaviour
   Hero carousel + product dropdown/flyout nav + mission toggle + product cards.
   All pieces are guarded so this one file works safely on every page,
   whether or not that page contains the matching markup. */

/* ---- Hero carousel (home page only) ---- */
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.getElementById('heroDots');
  if (!slides.length || !dotsWrap) return;

  let current = 0;
  slides.forEach((_, i) => {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('span');

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  window.heroMove = function (dir) { goTo(current + dir); };
  setInterval(() => goTo(current + 1), 5000);
})();

/* ---- Off-canvas menu, triggered by header hamburger or bottom-nav ---- */
(function () {
  const menu = document.getElementById('mainMenu');
  const topMenuBtn = document.getElementById('topMenuBtn');
  const bottomMenuBtn = document.getElementById('bottomMenuBtn');
  const backdrop = document.getElementById('navBackdrop');
  if (!menu || !backdrop) return;

  const triggers = [topMenuBtn, bottomMenuBtn].filter(Boolean);

  function setExpanded(val) {
    triggers.forEach(function (btn) { btn.setAttribute('aria-expanded', val); });
  }
  function openMenu() {
    menu.classList.add('open');
    backdrop.classList.add('open');
    setExpanded('true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    backdrop.classList.remove('open');
    setExpanded('false');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  }

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });
  });
  backdrop.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ---- Product dropdown / flyout nav (every page) ----
   Supports more than one flyout inside the Product dropdown (e.g.
   "Oscillating Knife Cutting" and "Laser Cutting" side by side). */
(function () {
  const product = document.querySelector('.has-dropdown');
  const productButton = document.querySelector('.dropdown-toggle');
  const flyouts = document.querySelectorAll('.has-flyout');

  function closeAllFlyouts() {
    flyouts.forEach(function (fo) {
      fo.classList.remove('open');
      const btn = fo.querySelector('.flyout-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function openProduct() {
    if (!product) return;
    product.classList.add('open');
    if (productButton) productButton.setAttribute('aria-expanded', 'true');
  }
  function closeProduct() {
    if (!product) return;
    product.classList.remove('open');
    if (productButton) productButton.setAttribute('aria-expanded', 'false');
    closeAllFlyouts();
  }

  if (product) {
    product.addEventListener('mouseenter', openProduct);
    product.addEventListener('mouseleave', closeProduct);
  }

  if (product && productButton) {
    productButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const open = product.classList.toggle('open');
      productButton.setAttribute('aria-expanded', String(open));
      if (!open) closeAllFlyouts();
    });
  }

  flyouts.forEach(function (flyout) {
    const flyoutButton = flyout.querySelector('.flyout-toggle');
    if (!flyoutButton) return;

    flyout.addEventListener('mouseenter', function () {
      flyout.classList.add('open');
      flyoutButton.setAttribute('aria-expanded', 'true');
    });
    flyout.addEventListener('mouseleave', function () {
      flyout.classList.remove('open');
      flyoutButton.setAttribute('aria-expanded', 'false');
    });
    flyoutButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const open = flyout.classList.toggle('open');
      flyoutButton.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', function () {
    closeProduct();
  });
})();

/* ---- Current-page navigation state ---- */
(function () {
  const menu = document.getElementById('mainMenu');
  if (!menu) return;

  const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
  const links = menu.querySelectorAll('a[href]');
  const productItem = menu.querySelector('.has-dropdown');
  const productButton = menu.querySelector('.dropdown-toggle');

  function updateNavState() {
    let productIsCurrent = false;
    links.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href.charAt(0) === '#') return; // in-page section link — handled by the scrollspy below
      const parts = href.split('#');
      const target = parts[0].toLowerCase();
      let isCurrent = target === currentPage || (currentPage === 'index.html' && target === '');
      // Product-menu deep links (e.g. Special Sewing Machines) are only "current" while their hash is open;
      // their parent page link (Special Sewing Machines) stays current on the whole page.
      if (isCurrent && parts[1] && link.closest('.dropdown')) isCurrent = window.location.hash === '#' + parts[1] || (window.location.hash === '' && parts[1] === 'specialSewingHeading');
      link.classList.toggle('active', isCurrent);
      if (isCurrent && link.closest('.dropdown')) productIsCurrent = true;
    });

    if (productButton) productButton.classList.toggle('active', productIsCurrent);
    if (productItem) productItem.classList.toggle('active', productIsCurrent);
  }

  updateNavState();
  window.addEventListener('hashchange', updateNavState);
})();

/* ---- Scrollspy: highlight the nav item for the section currently in view (index.html only) ---- */
(function () {
  const ids = ['home', 'about', 'advantages', 'training', 'contact', 'videos', 'technology-praxis'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const menu = document.getElementById('mainMenu');
  if (!sections.length || !menu) return;

  const navLinks = {};
  sections.forEach(function (sec) {
    const link = menu.querySelector('a[href="#' + sec.id + '"]');
    if (link) navLinks[sec.id] = link;
  });

  function setActive(id) {
    Object.keys(navLinks).forEach(function (key) {
      navLinks[key].classList.toggle('active', key === id);
    });
  }

  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (sec) { io.observe(sec); });
})();

/* ---- Temporary product image fallback ---- */
document.querySelectorAll('.sm-photo img[data-fallback]').forEach(function (image) {
  image.addEventListener('error', function () {
    const fallback = image.getAttribute('data-fallback');
    if (!fallback || image.src.endsWith(fallback)) return;
    image.src = fallback;
  });
});

/* ---- Our Company Mission — click to collapse/expand (home page) ---- */
(function () {
  const btn = document.querySelector('.mission-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
  });
})();

/* ---- Product card: click to pin open / close (sewing-machines page) ---- */
document.querySelectorAll('.prod-card').forEach(function (card) {
  card.addEventListener('click', function (event) {
    event.stopPropagation();
    card.classList.toggle('open');
  });
});

/* ---- Product showcase cards + detail modal (sewing-machines page) ---- */
(function () {
  const modal = document.getElementById('smModal');
  const cards = document.querySelectorAll('.sm-card');
  if (!modal || !cards.length) return;

  const modalPanel = modal.querySelector('.sm-modal-panel');
  const photoWrap = modal.querySelector('.sm-modal-photo');
  const imgEl = document.getElementById('smModalImg');
  const titleEl = document.getElementById('smModalTitle');
  const bodyEl = document.getElementById('smModalBody');
  const closeBtn = modal.querySelector('.sm-modal-close');
  let lastFocused = null;

  /* Build a row of thumbnails under the main modal image from a card's
     data-gallery JSON (see the 878-M PREMIUM card). Clicking a
     thumbnail swaps the large image — no page reload, no new modal.
     Cards without data-gallery never call this, so every other
     product keeps its original single-image modal untouched. */
  function buildGallery(images) {
    const wrap = document.createElement('div');
    wrap.className = 'sm-modal-gallery';

    images.forEach(function (item, index) {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'sm-thumb' + (index === 0 ? ' is-active' : '');
      thumb.setAttribute('aria-label', 'Show image ' + (index + 1) + ': ' + item.name);

      const thumbImg = document.createElement('img');
      thumbImg.src = item.src;
      thumbImg.alt = item.name;
      thumbImg.loading = 'lazy';

      const thumbName = document.createElement('span');
      thumbName.className = 'sm-thumb-name';
      // Complete galleries use "<machine> – <view>" names; show only the view on the thumbnail.
      thumbName.textContent = item.name.indexOf(' – ') > -1 ? item.name.split(' – ').slice(1).join(' – ') : item.name;

      thumb.appendChild(thumbImg);
      thumb.appendChild(thumbName);

      thumb.addEventListener('click', function () {
        if (!imgEl) return;
        imgEl.src = item.src;
        imgEl.alt = item.name;
        wrap.querySelectorAll('.sm-thumb').forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });

      wrap.appendChild(thumb);
    });

    return wrap;
  }

  function openModal(card) {
    const nameEl = card.querySelector('.sm-info h4');
    const sourceImg = card.querySelector('.sm-photo img');
    const dataEl = card.querySelector('.sm-data');

    let galleryData = null;
    if (card.dataset.gallery) {
      try { galleryData = JSON.parse(card.dataset.gallery); } catch (e) { galleryData = null; }
    }

    if (titleEl) titleEl.textContent = nameEl ? nameEl.textContent : '';
    if (bodyEl) bodyEl.innerHTML = dataEl ? dataEl.innerHTML : '';
    if (modalPanel) modalPanel.scrollTop = 0;

    // Leather Sewing Machines Modal Gallery - Start
    // Cards flagged data-gallery-complete list EVERY image of the machine in
    // data-gallery (including the first one), so the main image starts as
    // gallery[0] and thumbnail #1 is the active one.
    const completeGallery = card.dataset.galleryComplete === 'true' && galleryData && galleryData.length;
    // Leather Sewing Machines Modal Gallery - End

    if (imgEl && photoWrap) {
      if (completeGallery) {
        imgEl.src = galleryData[0].src;
        imgEl.alt = galleryData[0].name;
        photoWrap.style.display = '';
      } else if (sourceImg) {
        imgEl.src = sourceImg.src;
        imgEl.alt = sourceImg.alt;
        photoWrap.style.display = '';
      } else {
        imgEl.removeAttribute('src');
        imgEl.alt = '';
        photoWrap.style.display = 'none';
      }
    }

    // Clear any gallery left over from a previously opened product,
    // then rebuild one only if this card provides gallery data.
    if (photoWrap) {
      const oldGallery = photoWrap.querySelector('.sm-modal-gallery');
      if (oldGallery) oldGallery.remove();
      if (galleryData && galleryData.length) {
        photoWrap.appendChild(buildGallery(galleryData));
      }
    }

    if (modalPanel) {
      modalPanel.classList.toggle('sm-modal-panel--wide', !!(galleryData && galleryData.length));
      modalPanel.classList.toggle('sm-modal-panel--gallery-complete', !!completeGallery);
    }

    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { openModal(card); });
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  modal.querySelectorAll('[data-sm-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

/* ---- Subtle fade/slide reveal as sections enter the viewport ---- */
(function () {
  const targets = document.querySelectorAll(
    '.plaincard, .video-card, .prod-card, .sm-card, .mission, .adv-card, .wwd-head, form.contactform, .wwd-photo'
  );
  if (!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    io.observe(el);
  });
})();
/* =====================================================================
   ADVANTAGES OF SEWING MACHINE — SPI
   Read More / Read Less toggle. No page reload, no fixed heights.
   ===================================================================== */

(function () {
  var toggleBtn = document.getElementById('spi-adv-toggle');
  var expandWrap = document.getElementById('spi-adv-expand');
  var extraList = document.getElementById('spi-adv-extra');

  if (!toggleBtn || !expandWrap) return;

  toggleBtn.addEventListener('click', function () {
    var isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    var nextOpen = !isOpen;

    toggleBtn.setAttribute('aria-expanded', String(nextOpen));
    expandWrap.classList.toggle('is-open', nextOpen);
    toggleBtn.textContent = nextOpen ? 'Read Less' : 'Read More…';

    if (nextOpen) {
      // Move keyboard focus into the newly revealed content once the
      // expand animation has finished, so keyboard users land on it.
      window.setTimeout(function () {
        extraList.setAttribute('tabindex', '-1');
        extraList.focus({ preventScroll: true });
      }, 200);
    }
  });
})();
/* =====================================================
   Lightbox behaviour for .prod-img-grid images
   Paste this block into assets/js/main.js
   (or keep it as its own file and include it after main.js)
   ===================================================== */
(function () {
  var modal   = document.getElementById('lightboxModal');
  var imgEl   = document.getElementById('lightboxImg');
  var capEl   = document.getElementById('lightboxCaption');
  var closeBt = document.getElementById('lightboxClose');
  var prevBt  = document.getElementById('lightboxPrev');
  var nextBt  = document.getElementById('lightboxNext');

  if (!modal) return; // modal markup not present on this page

  var currentGroup = [];
  var currentIndex = 0;

  function getGroup(triggerEl) {
    // group = all lightbox triggers inside the same .prod-img-grid
    var grid = triggerEl.closest('.prod-img-grid');
    return Array.prototype.slice.call(grid.querySelectorAll('.lightbox-trigger'));
  }

  function openLightbox(triggerEl) {
    currentGroup = getGroup(triggerEl);
    currentIndex = currentGroup.indexOf(triggerEl);
    showSlide(currentIndex);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function showSlide(index) {
    var item = currentGroup[index];
    var img = item.querySelector('img');
    var caption = item.querySelector('.prod-img-caption');
    imgEl.src = img.src;
    imgEl.alt = img.alt || '';
    capEl.textContent = caption ? caption.textContent : (img.alt || '');
    prevBt.style.display = currentGroup.length > 1 ? '' : 'none';
    nextBt.style.display = currentGroup.length > 1 ? '' : 'none';
  }

  function closeLightbox() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
    showSlide(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % currentGroup.length;
    showSlide(currentIndex);
  }

  document.querySelectorAll('.lightbox-trigger').forEach(function (el) {
    el.addEventListener('click', function () { openLightbox(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el);
      }
    });
  });

  closeBt.addEventListener('click', closeLightbox);
  prevBt.addEventListener('click', showPrev);
  nextBt.addEventListener('click', showNext);

  // click on dark backdrop (but not on the image itself) closes it
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
})();

/* =====================================================
   Oscillating Knife Cutting page — feature gallery
   Click a thumbnail to show its title + description.
   Paste into assets/js/main.js, or keep as its own file
   linked after main.js.
   ===================================================== */
(function () {
  document.querySelectorAll('.okc-feature-gallery').forEach(function (gallery) {
    var thumbs = gallery.querySelectorAll('.okc-feature-thumb');
    var titleEl = gallery.querySelector('.okc-feature-title');
    var descEl = gallery.querySelector('.okc-feature-desc');

    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        thumbs.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        if (titleEl) titleEl.textContent = btn.dataset.title || '';
        if (descEl) descEl.textContent = btn.dataset.desc || '';
      });
    });
  });
})();

/* ---- Contact form submission (moved from an inline <script> in index.html so all JS lives in this local file) ---- */
(function () {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  if (!form || !submitBtn || !formStatus) return;

  const setStatus = function (message, isError) {
    formStatus.textContent = message;
    // Colours come from CSS classes (no inline styles)
    formStatus.classList.toggle('is-error', !!isError);
    formStatus.classList.toggle('is-success', !isError);
  };

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (form.dataset.submitting === 'true') return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    form.dataset.submitting = 'true';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setStatus('Sending your message...', false);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json().catch(function () { return {}; });

      if (response.ok && data.success) {
        setStatus('Thank you! Your message has been sent successfully.', false);
        form.reset();
      } else {
        throw new Error(data.message || 'Submission failed.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Sorry, there was a problem sending your message. Please try again later.', true);
    } finally {
      form.dataset.submitting = 'false';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
})();

/* ---- Cookie consent for third-party embeds (YouTube, Google Maps) ----
   Embeds ship with data-consent-src instead of src, so nothing is requested from Google/YouTube
   until the visitor accepts. The choice is stored in localStorage under "spi_consent_v1". */
(function () {
  const KEY = 'spi_consent_v1';
  let state = null; // 'granted' | 'denied' | null
  try { state = window.localStorage.getItem(KEY); } catch (e) { state = null; }

  const embeds = Array.prototype.slice.call(document.querySelectorAll('iframe[data-consent-src]'));

  function save(value) {
    state = value;
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* storage unavailable: keep choice in memory */ }
  }

  function serviceName(frame) {
    return /youtube/.test(frame.getAttribute('data-consent-src')) ? 'YouTube' : 'Google Maps';
  }

  function removePlaceholder(frame) {
    const next = frame.nextElementSibling;
    if (next && next.classList.contains('consent-placeholder')) next.remove();
  }

  function addPlaceholder(frame) {
    if (frame.nextElementSibling && frame.nextElementSibling.classList.contains('consent-placeholder')) return;
    const name = serviceName(frame);
    const box = document.createElement('div');
    box.className = 'consent-placeholder';
    const msg = document.createElement('p');
    msg.textContent = name + ' content is hidden until you accept cookies for embedded content.';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'consent-btn';
    btn.textContent = 'Allow ' + name;
    btn.addEventListener('click', function () { save('granted'); apply(); });
    box.appendChild(msg);
    box.appendChild(btn);
    frame.insertAdjacentElement('afterend', box);
  }

  function apply() {
    embeds.forEach(function (frame) {
      if (state === 'granted') {
        removePlaceholder(frame);
        if (!frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-consent-src'));
      } else {
        frame.removeAttribute('src');
        addPlaceholder(frame);
      }
    });
    if (banner) banner.hidden = state !== null;
  }

  // Banner (built here so every page gets the same markup)
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.hidden = true;

  const text = document.createElement('p');
  text.appendChild(document.createTextNode('This website does not use analytics or advertising cookies. YouTube videos and Google Maps are third-party embeds that may set cookies, so they load only if you accept. '));
  const policy = document.createElement('a');
  policy.href = 'cookie-policy.html';
  policy.textContent = 'Read the cookie policy';
  text.appendChild(policy);
  text.appendChild(document.createTextNode('.'));

  const actions = document.createElement('div');
  actions.className = 'cookie-banner__actions';
  const reject = document.createElement('button');
  reject.type = 'button';
  reject.className = 'consent-btn consent-btn--ghost';
  reject.textContent = 'Reject';
  reject.addEventListener('click', function () { save('denied'); apply(); });
  const accept = document.createElement('button');
  accept.type = 'button';
  accept.className = 'consent-btn';
  accept.textContent = 'Accept embedded content';
  accept.addEventListener('click', function () { save('granted'); apply(); });
  actions.appendChild(reject);
  actions.appendChild(accept);

  banner.appendChild(text);
  banner.appendChild(actions);
  document.body.appendChild(banner);

  // "Cookie settings" links in the footer re-open the banner
  document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
    el.addEventListener('click', function () { banner.hidden = false; });
  });

  apply();
})();
