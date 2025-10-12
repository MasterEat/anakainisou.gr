const header=document.querySelector('.site-header');
const toggle=document.querySelector('.nav-toggle');
const overlay=document.getElementById('mobile-overlay');
const backdrop=document.querySelector('[data-backdrop]');
const focusableSel='a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
let lastFocused=null;

// sticky header σκιά
let lastY=0;
window.addEventListener('scroll',()=>{
  const y=window.scrollY||0;
  if(y>4 && lastY<=4) header?.classList.add('is-scrolled');
  else if(y<=4 && lastY>4) header?.classList.remove('is-scrolled');
  lastY=y;
});

function openMenu(){
  lastFocused=document.activeElement;
  toggle.setAttribute('aria-expanded','true');
  overlay.setAttribute('aria-hidden','false');
  backdrop.hidden=false;
  requestAnimationFrame(()=>backdrop.classList.add('is-visible'));
  document.body.style.overflow='hidden';
  // focus trap
  const first=overlay.querySelectorAll(focusableSel)[0];
  first?.focus();
}

function closeMenu(){
  toggle.setAttribute('aria-expanded','false');
  overlay.setAttribute('aria-hidden','true');
  backdrop.classList.remove('is-visible');
  setTimeout(()=>{backdrop.hidden=true;},280);
  document.body.style.overflow='';
  lastFocused?.focus();
}

toggle?.addEventListener('click',()=>{
  const expanded=toggle.getAttribute('aria-expanded')==='true';
  expanded?closeMenu():openMenu();
});

backdrop?.addEventListener('click',closeMenu);
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape' && overlay.getAttribute('aria-hidden')==='false') closeMenu();
  if(e.key==='Tab' && overlay.getAttribute('aria-hidden')==='false'){
    const f=[...overlay.querySelectorAll(focusableSel)];
    if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault(); }
  }
});

// Desktop submenu (Υπηρεσίες): ανοίγει με hover/focus ήδη από CSS. Πρόσθεσε keyboard support:
document.querySelectorAll('.has-submenu .submenu-toggle')?.forEach(btn=>{
  const panel=btn.parentElement.querySelector('.submenu');
  btn.addEventListener('click',(e)=>{ e.preventDefault(); const exp=btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded', String(!exp)); panel.style.display=exp?'':'grid'; });
  btn.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ btn.setAttribute('aria-expanded','false'); panel.style.display=''; btn.focus(); }});
  panel?.addEventListener('mouseleave',()=>{ btn.setAttribute('aria-expanded','false'); panel.style.display=''; });
  panel?.addEventListener('focusout',(event)=>{
    if(!panel.contains(event.relatedTarget)){
      btn.setAttribute('aria-expanded','false');
      panel.style.display='';
    }
  });
});

// Mobile accordion submenus
document.querySelectorAll('.overlay-accordion')?.forEach(btn=>{
  const panel=document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click',()=>{
    const exp=btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!exp));
    if(exp){ panel.hidden=true; }
    else { panel.hidden=false; panel.querySelector(focusableSel)?.focus(); }
  });
});

overlay?.querySelectorAll('a').forEach(link=>{
  link.addEventListener('click',()=>{
    if(toggle?.getAttribute('aria-expanded')==='true') closeMenu();
  });
});

// Footer year
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

// HERO slider (auto-change every 4s)
(function(){
  const imgs=[...document.querySelectorAll('.hero-slider img[data-hero]')];
  if(!imgs.length) return;
  let i=0; imgs[0].classList.add('active');
  setInterval(()=>{
    imgs[i].classList.remove('active');
    i=(i+1)%imgs.length;
    imgs[i].classList.add('active');
  },4000);
})();

// Process interactive description
const stepDesc=document.getElementById('step-desc');
document.querySelectorAll('.step').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.step').forEach(b=>b.removeAttribute('aria-current'));
    btn.setAttribute('aria-current','true');
    const m={
      1:'Επίσκεψη στον χώρο, αποτύπωση και μελέτη αναγκών.',
      2:'Γραπτή προσφορά με σαφή παραδοτέα και χρονοδιάγραμμα.',
      3:'Συντονισμός συνεργείων & ποιοτικός έλεγχος.',
      4:'Καθαρή παράδοση και after-sales υποστήριξη.'
    };
    stepDesc.textContent=m[btn.dataset.step]||'';
  });
});

// Gallery carousel buttons
document.querySelectorAll('[data-carousel]').forEach(car=>{
  const track=car.querySelector('[data-track]');
  car.querySelector('.prev')?.addEventListener('click',()=>track.scrollBy({left:-track.clientWidth*0.8,behavior:'smooth'}));
  car.querySelector('.next')?.addEventListener('click',()=>track.scrollBy({left:track.clientWidth*0.8,behavior:'smooth'}));
});

// Dummy form handler
const form=document.querySelector('form.form');
if(form){form.addEventListener('submit',e=>{e.preventDefault();alert('Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα.');form.reset();});}
