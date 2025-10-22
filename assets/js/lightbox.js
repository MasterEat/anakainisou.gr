(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    window.registerLightboxThumbs = function () {};
    window.openLightboxFromThumb = function () {};
    window.dispatchEvent(new CustomEvent('lightbox:ready'));
    return;
  }

  const imageEl = document.getElementById('lb-img');
  const countEl = document.getElementById('lb-count');
  const prevBtn = lightbox.querySelector('.lb-prev');
  const nextBtn = lightbox.querySelector('.lb-next');
  const dialogFrame = lightbox.querySelector('.lb-frame');
  const closeTriggers = lightbox.querySelectorAll('[data-lb-close]');
  const html = document.documentElement;

  if (!imageEl || !countEl || !prevBtn || !nextBtn || !dialogFrame) {
    window.registerLightboxThumbs = function () {};
    window.openLightboxFromThumb = function () {};
    window.dispatchEvent(new CustomEvent('lightbox:ready'));
    return;
  }

  dialogFrame.setAttribute('tabindex', '-1');

  const THUMB_SELECTOR = '.car-img, .gallery img, [data-lightbox-thumb]';
  const thumbnails = [];
  const seenThumbs = new WeakSet();

  let activeIndex = 0;
  let previousFocus = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  function registerThumb(thumb) {
    if (!(thumb instanceof HTMLImageElement)) {
      return;
    }

    if (seenThumbs.has(thumb)) {
      return;
    }

    seenThumbs.add(thumb);
    const index = thumbnails.push(thumb) - 1;

    thumb.style.cursor = 'zoom-in';
    thumb.setAttribute('data-lb-index', String(index));
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-haspopup', 'dialog');

    thumb.addEventListener('click', () => open(index));
    thumb.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(index);
      }
    });
  }

  function registerThumbs(list) {
    if (!list) {
      list = document.querySelectorAll(THUMB_SELECTOR);
    } else if (typeof list === 'string') {
      list = document.querySelectorAll(list);
    }

    if (list instanceof Element) {
      registerThumb(list);
      return;
    }

    if (typeof list[Symbol.iterator] !== 'function') {
      return;
    }

    Array.from(list).forEach(registerThumb);
  }

  function getActiveThumb() {
    return thumbnails[activeIndex] || null;
  }

  function getThumbSource(thumb) {
    if (!thumb) {
      return { src: '', alt: '' };
    }

    const src = thumb.dataset.full || thumb.currentSrc || thumb.src || '';
    const alt = thumb.alt || '';
    return { src, alt };
  }

  function open(index) {
    if (!thumbnails.length) {
      return;
    }

    const maxIndex = thumbnails.length - 1;
    activeIndex = Math.min(Math.max(index, 0), maxIndex);
    previousFocus = document.activeElement;

    render();
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
    const thumb = getActiveThumb();
    const total = thumbnails.length;

    if (!thumb || !total) {
      countEl.textContent = '0/0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      prevBtn.setAttribute('aria-disabled', 'true');
      nextBtn.setAttribute('aria-disabled', 'true');
      return;
    }

    const { src, alt } = getThumbSource(thumb);
    if (src && imageEl.src !== src) {
      imageEl.src = src;
    }
    imageEl.alt = alt;
    countEl.textContent = `${activeIndex + 1}/${total}`;

    const isFirst = activeIndex === 0;
    const isLast = activeIndex === total - 1;

    prevBtn.disabled = isFirst;
    nextBtn.disabled = isLast;

    prevBtn.setAttribute('aria-disabled', String(isFirst));
    nextBtn.setAttribute('aria-disabled', String(isLast));

    updateFocusable();
  }

  function goPrev() {
    if (activeIndex > 0) {
      activeIndex -= 1;
      render();
    }
  }

  function goNext() {
    if (activeIndex < thumbnails.length - 1) {
      activeIndex += 1;
      render();
    }
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

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', close);
  });

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
      goPrev();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
      return;
    }
  });

  document.addEventListener('keydown', trapFocus, true);

  registerThumbs(document.querySelectorAll(THUMB_SELECTOR));

  window.registerLightboxThumbs = function (nodes) {
    registerThumbs(nodes);
  };

  window.openLightboxFromThumb = function (target) {
    if (typeof target === 'number') {
      open(target);
      return;
    }

    if (target instanceof Element) {
      const index = thumbnails.indexOf(target);
      if (index !== -1) {
        open(index);
      }
    }
  };

  window.dispatchEvent(new CustomEvent('lightbox:ready'));
})();
