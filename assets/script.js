// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Lightweight lightbox (no external lib)
// Opens full image in an overlay with ESC/Click to close
(function(){
  const links = document.querySelectorAll('a.glightbox');
  if(!links.length) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;z-index:1000;padding:20px;';
  const img = document.createElement('img');
  img.style.maxWidth = '95%';
  img.style.maxHeight = '90%';
  img.alt = '';
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  const close = ()=> overlay.style.display='none';
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
  links.forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      img.src = a.getAttribute('href');
      img.alt = a.querySelector('img')?.alt || '';
      overlay.style.display='flex';
    });
  });
})();

// Dummy form handler (prevent reload). Replace with real endpoint when ready.
const form = document.querySelector('form.form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα.');
    form.reset();
  });
}
