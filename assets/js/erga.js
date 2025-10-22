(function () {
  const mount = document.getElementById('projects');
  if (!mount) {
    return;
  }

  const dataUrl = mount.dataset.json || '/data/projects.json';

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
      return json
        .filter((item) => item && typeof item === 'object')
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
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

    const thumbs = mount.querySelectorAll('[data-lightbox-thumb]');
    const registerThumbs = () => {
      if (typeof window.registerLightboxThumbs === 'function') {
        window.registerLightboxThumbs(thumbs);
      }
    };

    if (typeof window.registerLightboxThumbs === 'function') {
      registerThumbs();
    } else {
      window.addEventListener('lightbox:ready', function handleReady() {
        registerThumbs();
        window.removeEventListener('lightbox:ready', handleReady);
      });
    }

    mount.querySelectorAll('[data-open-gallery]').forEach((button) => {
      button.addEventListener('click', () => {
        const firstThumb = button.closest('.card')?.querySelector('[data-lightbox-thumb]');
        if (firstThumb && typeof firstThumb.click === 'function') {
          firstThumb.click();
        }
      });
    });
  }

  function renderCard(project, index) {
    const aspect = String(project.aspect || '4:3').trim();
    const folder = typeof project.folder === 'string' ? project.folder : '';
    const cover = toSrcset(folder, project.cover);
    const gallery = Array.isArray(project.gallery) ? project.gallery.slice(0, 6) : [];
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

    const thumbMarkup = gallery
      .map((file, imageIndex) => {
        const srcset = toSrcset(folder, file);
        const thumbAlt = `${project.title || 'Project'} – φωτογραφία ${imageIndex + 1}`;
        return `
        <picture>
          <source type="image/webp" srcset="${escapeAttr(srcset.webp)}" sizes="140px">
          <source type="image/jpeg" srcset="${escapeAttr(srcset.jpg)}" sizes="140px">
          <img src="${escapeAttr(srcset.jpg800)}" srcset="${escapeAttr(srcset.jpg)}" sizes="140px"
               alt="${escapeAttr(thumbAlt)}" loading="lazy" decoding="async"
               data-full="${escapeAttr(srcset.best)}" data-lightbox-thumb>
        </picture>`;
      })
      .join('');

    const badgeMarkup = badges
      .map((badge) => `<span class="badge">${badge}</span>`)
      .join('');

    const metaMarkup = metaParts.join('<span aria-hidden="true">•</span>');

    return `
      <article class="card" id="${escapeAttr(cardId)}">
        <div class="card-cover" data-aspect="${escapeAttr(aspect)}">
          <picture>
            <source type="image/webp" srcset="${escapeAttr(cover.webp)}" sizes="(min-width: 980px) 50vw, 100vw">
            <source type="image/jpeg" srcset="${escapeAttr(cover.jpg)}" sizes="(min-width: 980px) 50vw, 100vw">
            <img src="${escapeAttr(cover.jpg800)}" srcset="${escapeAttr(cover.jpg)}" sizes="(min-width: 980px) 50vw, 100vw"
                 alt="${escapeAttr(project.title || 'Project cover')}" loading="lazy" decoding="async">
          </picture>
          ${badgeMarkup ? `<div class="badges">${badgeMarkup}</div>` : ''}
        </div>
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(project.title || 'Project')}</h2>
          ${metaMarkup ? `<div class="card-meta">${metaMarkup}</div>` : ''}
          ${project.summary ? `<p class="card-summary">${escapeHtml(project.summary)}</p>` : ''}
          ${thumbMarkup ? `<div class="strip gallery">${thumbMarkup}</div>` : ''}
        </div>
        <div class="card-footer">
          <a class="btn btn-ghost" href="/epikoinonia">Ζητήστε Προσφορά</a>
          ${thumbMarkup ? '<button class="btn btn-primary" type="button" data-open-gallery>Προβολή Gallery</button>' : ''}
        </div>
      </article>
    `;
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
      return { webp: '', jpg: '', jpg800: '', best: '' };
    }

    const basePath = joinPath(folder, filename);
    const withoutExt = basePath.replace(/\.(webp|jpe?g|png)$/i, '');
    const root = withoutExt.replace(/-(800|1200|1600)$/i, '');

    return {
      webp: `${root}-800.webp 800w, ${root}-1200.webp 1200w, ${root}-1600.webp 1600w`,
      jpg: `${root}-800.jpg 800w, ${root}-1200.jpg 1200w, ${root}-1600.jpg 1600w`,
      jpg800: `${root}-800.jpg`,
      best: `${root}-1600.webp`
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
