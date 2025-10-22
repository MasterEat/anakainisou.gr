(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) {
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
    return;
  }

  dialogFrame.setAttribute('tabindex', '-1');

  const thumbnails = Array.from(
    document.querySelectorAll('.car-img, .gallery img')
  ).filter((el, index, arr) => el instanceof HTMLImageElement && arr.indexOf(el) === index);

  if (!thumbnails.length) {
    return;
  }

  const sources = thumbnails.map((thumb) => ({
    src: thumb.currentSrc || thumb.src,
    alt: thumb.alt || ''
  }));

  let activeIndex = 0;
  let previousFocus = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  thumbnails.forEach((thumb, index) => {
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
  });

  function open(index) {
    activeIndex = index;
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
    const currentItem = sources[activeIndex];
    if (!currentItem) {
      return;
    }

    if (imageEl.src !== currentItem.src) {
      imageEl.src = currentItem.src;
    }
    imageEl.alt = currentItem.alt;
    countEl.textContent = `${activeIndex + 1}/${sources.length}`;

    const isFirst = activeIndex === 0;
    const isLast = activeIndex === sources.length - 1;

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
    if (activeIndex < sources.length - 1) {
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
})();
