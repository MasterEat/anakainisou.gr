(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    window.registerLightboxThumbs = function () {};
    window.openLightboxFromThumb = function () {};
    window.openLightboxFromEl = function () {};
    window.dispatchEvent(new CustomEvent('lightbox:ready'));
    return;
  }

  const imageEl = document.getElementById('lb-img');
  const countEl = document.getElementById('lb-count');
  const prevBtn = lightbox.querySelector('.lb-prev');
  const nextBtn = lightbox.querySelector('.lb-next');
  const dialogFrame = lightbox.querySelector('.lb-frame');
  const closeTriggers = Array.from(
    lightbox.querySelectorAll('[data-lb-close]')
  ).filter((el) => !el.classList.contains('lb-backdrop'));
  const backdrop = lightbox.querySelector('.lb-backdrop');
  const html = document.documentElement;

  if (!imageEl || !countEl || !prevBtn || !nextBtn || !dialogFrame) {
    window.registerLightboxThumbs = function () {};
    window.openLightboxFromThumb = function () {};
    window.openLightboxFromEl = function () {};
    window.dispatchEvent(new CustomEvent('lightbox:ready'));
    return;
  }

  dialogFrame.setAttribute('tabindex', '-1');

  let currentGroup = [];
  let currentIndex = 0;
  let previousFocus = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  function resolveImageSource(el) {
    if (!el) {
      return { src: '', alt: '' };
    }

    const src = el.dataset.full || el.currentSrc || el.src || '';
    const alt = el.alt || '';

    return { src, alt };
  }

  function openFromElement(el) {
    if (!(el instanceof Element)) {
      return;
    }

    const groupId = el.dataset.lbGroup || 'default';
    const selector = `.lb-trigger[data-lb-group="${groupId}"]`;
    const groupItems = Array.from(document.querySelectorAll(selector));

    if (!groupItems.length) {
      currentGroup = [el];
      currentIndex = 0;
    } else {
      currentGroup = groupItems;
      const index = currentGroup.indexOf(el);
      currentIndex = index === -1 ? 0 : index;
    }

    previousFocus = document.activeElement instanceof Element ? document.activeElement : el;

    render();
    open();
  }

  function open() {
    if (!currentGroup.length) {
      return;
    }

    lightbox.classList.add('on');
    lightbox.setAttribute('aria-hidden', 'false');
    html.style.overflow = 'hidden';
    updateFocusable();

    requestAnimationFrame(() => {
      dialogFrame.focus({ preventScroll: true });
    });
  }

  function close() {
    if (!lightbox.classList.contains('on')) {
      return;
    }

    lightbox.classList.remove('on');
    lightbox.setAttribute('aria-hidden', 'true');
    html.style.overflow = '';

    if (previousFocus && typeof previousFocus.focus === 'function') {
      requestAnimationFrame(() => {
        previousFocus.focus();
      });
    }
  }

  function render() {
    const activeEl = currentGroup[currentIndex];
    const total = currentGroup.length;

    if (!activeEl || !total) {
      countEl.textContent = '0/0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      prevBtn.setAttribute('aria-disabled', 'true');
      nextBtn.setAttribute('aria-disabled', 'true');
      return;
    }

    const { src, alt } = resolveImageSource(activeEl);
    if (src && imageEl.src !== src) {
      imageEl.src = src;
    }
    imageEl.alt = alt;
    countEl.textContent = `${currentIndex + 1}/${total}`;

    const disableNav = total <= 1;

    prevBtn.disabled = disableNav;
    nextBtn.disabled = disableNav;

    prevBtn.setAttribute('aria-disabled', String(disableNav));
    nextBtn.setAttribute('aria-disabled', String(disableNav));

    updateFocusable();
  }

  function go(delta) {
    const total = currentGroup.length;
    if (!total) {
      return;
    }

    currentIndex = (currentIndex + delta + total) % total;
    render();
  }

  function updateFocusable() {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    focusableElements = Array.from(lightbox.querySelectorAll(selector)).filter((el) => !el.hasAttribute('disabled'));
    firstFocusable = focusableElements[0] || dialogFrame;
    lastFocusable = focusableElements[focusableElements.length - 1] || dialogFrame;
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') {
      return;
    }

    if (!lightbox.classList.contains('on')) {
      return;
    }

    if (!focusableElements.length) {
      event.preventDefault();
      dialogFrame.focus();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', close);
  });

  if (backdrop) {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        close();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('on')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
      return;
    }
  });

  document.addEventListener('keydown', trapFocus, true);

  window.openLightboxFromEl = openFromElement;
  window.openLightboxFromThumb = openFromElement;
  window.registerLightboxThumbs = function () {};

  window.dispatchEvent(new CustomEvent('lightbox:ready'));
})();
