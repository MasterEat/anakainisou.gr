# Lazy loading audit

The audit verifies that all non-LCP images opt into `loading="lazy"` and `decoding="async"`, while above-the-fold assets keep eager behaviour.

## Automated summary

Command: `npm run audit:lazy --silent`

```
Lazy-loading audit report
================================

No images missing loading="lazy" outside approved exceptions.

Allowed exceptions (not lazied intentionally):
  - erga.html:32 (hero/logo or above-the-fold) → <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">
  - erga.html:117 (lightbox full-size image) → <img id="lb-img" class="lb-img" alt="" decoding="async">
  - index.html:90 (hero/logo or above-the-fold) → <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">
  - index.html:151 (hero/logo or above-the-fold) → <img data-hero src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop" width="1600" height="1067" alt="Ανακαίνιση σαλονιού στην Αθήνα από FM Renovation με νέα διάταξη επίπλων και φωτισμό που αναδεικνύει τον χώρο της κατοικίας." fetchpriority="high" decoding="sync">
  - index.html:513 (lightbox full-size image) → <img id="lb-img" class="lb-img" alt="" decoding="async">
  - privacy-policy.html:25 (hero/logo or above-the-fold) → <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">
  - terms.html:25 (hero/logo or above-the-fold) → <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">

No additional issues detected.
```

## ripgrep spot checks

The following commands exclude `node_modules/`, build artefacts, tooling, and documentation to focus on rendered assets.

### 1. `<img>` elements without `loading`

Command:

```
rg -n --pcre2 --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!tools/**' --glob '!docs/**' '<img(?![^>]*\bloading=)[^>]*>' .
```

Output:

```
./privacy-policy.html
25:          <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">

./erga.html
32:          <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">
117:      <img id="lb-img" class="lb-img" alt="" decoding="async">

./index.html
90:          <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">
151:        <img data-hero src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop" width="1600" height="1067" alt="Ανακαίνιση σαλονιού στην Αθήνα από FM Renovation με νέα διάταξη επίπλων και φωτισμό που αναδεικνύει τον χώρο της κατοικίας." fetchpriority="high" decoding="sync">
513:      <img id="lb-img" class="lb-img" alt="" decoding="async">

./terms.html
25:          <img class="brand-logo" src="images/logo.png" alt="FM Renovation λογότυπο" width="1024" height="1024" fetchpriority="high" decoding="sync">
```

All matches are intentional eager loads (hero/logo or lightbox canvases).

### 2. `<picture>` blocks with inner `<img>` missing `loading`

Command:

```
rg -n --pcre2 --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!tools/**' --glob '!docs/**' '<picture>[\s\S]*?<img(?![^>]*\bloading=)[^>]*>[\s\S]*?</picture>' .
```

Output: _none_

### 3. JavaScript image creation without lazy hints

Command:

```
rg -n --pcre2 --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!tools/**' --glob '!docs/**' 'new Image\(|document\.createElement\(['\"']img['\"']\)|\.innerHTML\s*=\s*`[^`]*<img' .
```

Output: _none_

### 4. Gallery thumbnails missing `loading="lazy"`

Command:

```
rg -n --pcre2 --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!tools/**' --glob '!docs/**' '<img[^>]*(class="[^"]*(thumb|strip|gallery)[^"]*")[^>]*>(?!.*\bloading="lazy")' .
```

Output: _none_
