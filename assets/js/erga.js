(function () {
  const mount = document.getElementById('projects');
  if (!mount) {
    return;
  }

  const dataUrl = mount.dataset.json || 'data/projects.json';

  fetchProjects(dataUrl)
    .then((projects) => {
      renderProjects(projects);
      updateSchema(projects);
    })
    .catch(() => {
      renderProjects([]);
      updateSchema([]);
    });

  async function fetchProjects(url) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }
      const json = await response.json();
      if (!Array.isArray(json)) {
        return [];
      }
      return json.filter((item) => item && typeof item === 'object');
    } catch (error) {
      return [];
    }
  }

  function renderProjects(items) {
    if (!Array.isArray(items) || !items.length) {
      mount.innerHTML = '<p class="projects-empty"><strong>Σύντομα διαθέσιμο</strong><br>Ετοιμάζουμε νέα case studies με αναλυτικές φωτογραφίες.</p>';
      return;
    }

    const markup = items
      .map((project, index) => renderCard(project, index))
      .join('');

    mount.innerHTML = markup;

    const cards = mount.querySelectorAll('.card');
    cards.forEach((card, groupIndex) => {
      const groupId = `proj-${groupIndex}`;
      const triggers = card.querySelectorAll('.strip img, .gallery img, .card-cover picture img');

      triggers.forEach((img, imageIndex) => {
        if (!(img instanceof HTMLImageElement)) {
          return;
        }

        img.classList.add('lb-trigger');
        img.dataset.lbGroup = groupId;
        img.dataset.lbIndex = String(imageIndex);
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-haspopup', 'dialog');
        img.style.cursor = 'zoom-in';

        if (!img.dataset.full) {
          const picture = img.closest('picture');
          const source = picture?.querySelector('source[type="image/webp"]') || picture?.querySelector('source');
          if (source && source.getAttribute('srcset')) {
            const bestSrc = source
              .getAttribute('srcset')
              .split(',')
              .map((entry) => entry.trim().split(' ')[0])
              .filter(Boolean)
              .pop();
            if (bestSrc) {
              img.dataset.full = bestSrc;
            }
          }
        }

        if (!img.alt) {
          const title = card.querySelector('.card-title')?.textContent?.trim();
          img.alt = title || 'Project image';
        }

        img.addEventListener('click', () => {
          if (typeof window.openLightboxFromEl === 'function') {
            window.openLightboxFromEl(img);
          }
        });

        img.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (typeof window.openLightboxFromEl === 'function') {
              window.openLightboxFromEl(img);
            }
          }
        });
      });

      const cta = card.querySelector('[data-open-gallery]');
      if (cta && triggers[0]) {
        cta.addEventListener('click', () => {
          triggers[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        });
      }
    });
  }

  function renderCard(project, index) {
    const aspect = String(project.aspect || '4:3').trim();
    const folder = typeof project.folder === 'string' ? project.folder : '';
    const cover = toSrcset(folder, project.cover);
    const layout = typeof project.layout === 'string' ? project.layout.trim().toLowerCase() : '';
    const isMinimalGrid = layout === 'minimal-grid';
    const cardClasses = ['card'];
    if (isMinimalGrid) {
      cardClasses.push('card--minimal');
    }
    const galleryGroups = normalizeGallery(project.gallery);
    const hasGallery = galleryGroups.some((group) => group.images.length);
    const cardId = project.id ? String(project.id) : `project-${index + 1}`;
    const badges = [project.category, project.location].filter(Boolean).map(escapeHtml);
    const metaParts = [];

    if (project.location) {
      metaParts.push(`<span>${escapeHtml(project.location)}</span>`);
    }

    if (project.date) {
      const formatted = formatDate(project.date);
      metaParts.push(`<time datetime="${escapeAttr(normalizeDate(project.date))}">${escapeHtml(formatted)}</time>`);
    }

    const galleryWrapperClass = isMinimalGrid ? 'gallery gallery--grid' : 'strip gallery';
    const galleryMarkup = galleryGroups
      .map((group) => {
        const sectionTitle = group.title ? `<h3 class="gallery-title">${escapeHtml(group.title)}</h3>` : '';
        const imagesMarkup = group.images
          .map((image, imageIndex) => {
            const srcset = toSrcset(folder, image.file);
            const thumbAlt = image.alt
              ? image.alt
              : `${project.title || 'Project'}${group.title ? ` – ${group.title}` : ''} – φωτογραφία ${imageIndex + 1}`;
            return `
            <picture>
              ${srcset.webp ? `<source type="image/webp" srcset="${escapeAttr(srcset.webp)}" sizes="140px">` : ''}
              <source type="${escapeAttr(srcset.type || 'image/jpeg')}" srcset="${escapeAttr(srcset.jpg)}" sizes="140px">
              <img src="${escapeAttr(srcset.jpg800)}" srcset="${escapeAttr(srcset.jpg)}" sizes="140px"
                   alt="${escapeAttr(thumbAlt)}" loading="lazy" decoding="async"
                   data-full="${escapeAttr(srcset.best)}" data-lightbox-thumb>
            </picture>`;
          })
          .join('');

        if (!imagesMarkup) {
          return '';
        }

        return `
          <section class="gallery-group">
            ${sectionTitle}
            <div class="${escapeAttr(galleryWrapperClass)}">${imagesMarkup}</div>
          </section>
        `;
      })
      .join('');

    const badgeMarkup = badges
      .map((badge) => `<span class="badge">${badge}</span>`)
      .join('');

    const metaMarkup = metaParts.join('<span aria-hidden="true">•</span>');

    const detailList = Array.isArray(project.details)
      ? project.details
          .map((detail) => (typeof detail === 'string' && detail.trim() ? `<li>${escapeHtml(detail)}</li>` : ''))
          .filter(Boolean)
          .join('')
      : '';

    const noteMarkup = project.note ? `<p class="card-note">${escapeHtml(project.note)}</p>` : '';

    const coverMarkup = isMinimalGrid
      ? ''
      : `
        <div class="card-cover" data-aspect="${escapeAttr(aspect)}">
          <picture>
            ${cover.webp ? `<source type="image/webp" srcset="${escapeAttr(cover.webp)}" sizes="(min-width: 980px) 50vw, 100vw">` : ''}
            <source type="${escapeAttr(cover.type || 'image/jpeg')}" srcset="${escapeAttr(cover.jpg)}" sizes="(min-width: 980px) 50vw, 100vw">
            <img src="${escapeAttr(cover.jpg800)}" srcset="${escapeAttr(cover.jpg)}" sizes="(min-width: 980px) 50vw, 100vw"
                 alt="${escapeAttr(project.title || 'Project cover')}" loading="lazy" decoding="async"
                 data-full="${escapeAttr(cover.best)}">
          </picture>
          ${badgeMarkup ? `<div class="badges">${badgeMarkup}</div>` : ''}
        </div>
      `;

    const footerMarkup = isMinimalGrid
      ? ''
      : `
        <div class="card-footer">
          <a class="btn btn--ghost" href="index.html#contact">Ζητήστε Προσφορά</a>
          ${hasGallery ? '<button class="btn btn--primary" type="button" data-open-gallery>Προβολή Gallery</button>' : ''}
        </div>
      `;

    return `
      <article class="${escapeAttr(cardClasses.join(' '))}" id="${escapeAttr(cardId)}">
        ${coverMarkup}
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(project.title || 'Project')}</h2>
          ${metaMarkup ? `<div class="card-meta">${metaMarkup}</div>` : ''}
          ${project.summary ? `<p class="card-summary">${escapeHtml(project.summary)}</p>` : ''}
          ${detailList ? `<ul class="card-details">${detailList}</ul>` : ''}
          ${noteMarkup}
          ${galleryMarkup}
        </div>
        ${footerMarkup}
      </article>
    `;
  }

  function normalizeGallery(gallery) {
    if (!Array.isArray(gallery) || !gallery.length) {
      return [];
    }

    const isFlat = gallery.every((item) => typeof item === 'string' || (item && typeof item === 'object' && !Array.isArray(item.images)));

    if (isFlat) {
      const images = gallery
        .map((item) => normalizeImage(item))
        .filter(Boolean);

      return images.length ? [{ title: '', images }] : [];
    }

    return gallery
      .map((group) => {
        if (!group || typeof group !== 'object' || !Array.isArray(group.images)) {
          return null;
        }

        const images = group.images
          .map((item) => normalizeImage(item))
          .filter(Boolean);

        if (!images.length) {
          return null;
        }

        return {
          title: typeof group.title === 'string' ? group.title : '',
          images
        };
      })
      .filter(Boolean);
  }

  function normalizeImage(item) {
    if (typeof item === 'string') {
      const file = item.trim();
      if (!file) {
        return null;
      }

      return { file, alt: '' };
    }

    if (!item || typeof item !== 'object') {
      return null;
    }

    const rawFile =
      typeof item.file === 'string'
        ? item.file
        : typeof item.src === 'string'
          ? item.src
          : '';

    const file = rawFile.trim();
    if (!file) {
      return null;
    }

    return {
      file,
      alt: typeof item.alt === 'string' ? item.alt.trim() : ''
    };
  }

  function updateSchema(items) {
    const schemaEl = document.getElementById('erga-schema');
    if (!schemaEl) {
      return;
    }

    const validItems = Array.isArray(items) ? items : [];
    const pageUrl = getPageUrl();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Case studies ανακαινίσεων',
      url: pageUrl,
      numberOfItems: validItems.length,
      itemListElement: validItems.map((project, index) => {
        const cardId = project.id ? String(project.id) : `project-${index + 1}`;
        const cover = toSrcset(project.folder || '', project.cover);
        const itemUrl = `${pageUrl}#${cardId}`;
        const resolvedImage = resolveUrl(cover.best);
        const listItem = {
          '@type': 'ListItem',
          position: index + 1,
          name: project.title || `Project ${index + 1}`,
          url: itemUrl
        };

        if (project.summary) {
          listItem.description = project.summary;
        }

        if (resolvedImage) {
          listItem.image = resolvedImage;
        }

        return listItem;
      })
    };

    schemaEl.textContent = JSON.stringify(schema);
  }

  function toSrcset(folder, filename) {
    if (!filename) {
      return { webp: '', jpg: '', jpg800: '', best: '', type: 'image/jpeg' };
    }

    const basePath = joinPath(folder, filename);
    const extensionMatch = basePath.match(/\.(webp|jpe?g|png)$/i);

    if (!extensionMatch) {
      return { webp: '', jpg: `${basePath} 1x`, jpg800: basePath, best: basePath, type: 'image/jpeg' };
    }

    const ext = extensionMatch[1].toLowerCase();
    const withoutExt = basePath.slice(0, -extensionMatch[0].length);
    const sizeMatch = withoutExt.match(/-(800|1200|1600)$/i);

    if (sizeMatch) {
      const root = withoutExt.replace(/-(800|1200|1600)$/i, '');
      return {
        webp: `${root}-800.webp 800w, ${root}-1200.webp 1200w, ${root}-1600.webp 1600w`,
        jpg: `${root}-800.jpg 800w, ${root}-1200.jpg 1200w, ${root}-1600.jpg 1600w`,
        jpg800: `${root}-800.jpg`,
        best: `${root}-1600.webp`,
        type: 'image/jpeg'
      };
    }

    const jpgSrcset = `${basePath} 1x`;
    const best = basePath;

    return {
      webp: ext === 'webp' ? `${basePath} 1x` : '',
      jpg: jpgSrcset,
      jpg800: basePath,
      best,
      type: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    };
  }

  function joinPath(folder, filename) {
    const safeFolder = typeof folder === 'string' ? folder.trim() : '';
    const safeFile = typeof filename === 'string' ? filename.trim() : '';

    if (!safeFolder) {
      return safeFile;
    }

    if (!safeFile) {
      return safeFolder;
    }

    if (safeFile.startsWith('/')) {
      return safeFile;
    }

    if (safeFolder.endsWith('/')) {
      return `${safeFolder}${safeFile}`;
    }

    return `${safeFolder}/${safeFile}`;
  }

  function normalizeDate(dateString) {
    if (typeof dateString !== 'string') {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    if (/^\d{4}-\d{2}$/.test(dateString)) {
      return `${dateString}-01`;
    }

    return dateString;
  }

  function formatDate(dateString) {
    const normalized = normalizeDate(dateString);
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat('el-GR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  function escapeHtml(value) {
    if (value === undefined || value === null) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function resolveUrl(path) {
    if (!path) {
      return '';
    }

    try {
      return new URL(path, getPageUrl()).href;
    } catch (error) {
      return path;
    }
  }

  function getPageUrl() {
    const origin = window.location.origin;
    if (origin && origin !== 'null') {
      return `${origin}${window.location.pathname}`;
    }
    return window.location.href;
  }
})();
