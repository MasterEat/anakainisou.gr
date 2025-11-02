# Lazy loading policy

This site prioritises Largest Contentful Paint (LCP) and scroll performance. Apply the following rules when adding or updating media elements:

- **Hero, LCP, and primary logo images**: keep them eager. Do not add `loading="lazy"`; instead, set `fetchpriority="high"` and prefer `decoding="sync"` so that the browser decodes them immediately.
- **Above-the-fold illustrations** (e.g. within the first viewport) should follow the same eager loading rules as the hero so that they contribute positively to LCP.
- **Below-the-fold content images** must set `loading="lazy"` and `decoding="async"` to defer work until the user scrolls near them.
- **Thumbnails, carousel slides, and gallery strips** should always be lazy-loaded; include the async decoding hint as well.
- **Lightbox full-size images** are loaded on demand by JavaScript. Keep them eager once requested, but make sure thumbnails that launch the lightbox are lazy.
- **`<picture>` elements** still apply the lazy attributes on the inner `<img>` element (the `<source>` tags stay unchanged).
- **Images generated from JavaScript** should have `img.loading = 'lazy'` and `img.decoding = 'async'` by default. Only skip these hints for hero/LCP placeholders.
- **Width and height attributes**: whenever the intrinsic dimensions of an image are known, include `width` and `height` to avoid layout shifts.
- **Content images in CSS backgrounds** are discouraged because they cannot be lazy-loaded. Replace them with semantic `<img>` elements where practical.

Review new pages against `npm run audit:lazy` to ensure the policy is respected.
