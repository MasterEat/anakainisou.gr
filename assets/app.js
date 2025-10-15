// Navigation interactions
const body=document.body;
const navToggle=document.querySelector('[data-nav-toggle]');
const navOverlay=document.getElementById('mobile-menu');
const navBackdrop=document.querySelector('[data-nav-backdrop]');
const navClose=document.querySelector('[data-nav-close]');
const desktopMedia=window.matchMedia('(min-width: 768px)');
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const focusableSelectors="a[href]:not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), [tabindex]:not([tabindex='-1'])";
let menuOpen=false;

const mobileParent=document.querySelector('[data-mobile-parent]');
const mobileItem=mobileParent?mobileParent.closest('.nav-mobile__item'):null;
const mobileSubLinks=mobileItem?Array.from(mobileItem.querySelectorAll('.nav-mobile__submenu a')):[];
function setMobileSubmenu(open){
  if(!mobileParent||!mobileItem){return;}
  mobileParent.setAttribute('aria-expanded',String(open));
  mobileItem.classList.toggle('nav-mobile__item--open',open);
  mobileSubLinks.forEach(function(link){
    if(open){link.removeAttribute('tabindex');}
    else{link.setAttribute('tabindex','-1');}
  });
}
if(mobileSubLinks.length){setMobileSubmenu(false);}else if(mobileParent){mobileParent.setAttribute('aria-expanded','false');}

function getFocusableElements(){
  if(!navOverlay){return[];}
  return Array.from(navOverlay.querySelectorAll(focusableSelectors)).filter(function(el){
    return el.tabIndex>=0&&!el.hasAttribute('disabled');
  });
}

function trapFocus(event){
  if(!menuOpen||event.key!=='Tab'){return;}
  const focusable=getFocusableElements();
  if(!focusable.length){return;}
  const first=focusable[0];
  const last=focusable[focusable.length-1];
  if(event.shiftKey){
    if(document.activeElement===first){
      event.preventDefault();
      last.focus();
    }
  }else if(document.activeElement===last){
    event.preventDefault();
    first.focus();
  }
}

function handleOverlayEsc(event){
  if(event.key==='Escape'&&menuOpen){
    event.preventDefault();
    closeMenu();
  }
}

function openMenu(){
  if(!navToggle||!navOverlay||!navBackdrop||menuOpen){return;}
  menuOpen=true;
  setMobileSubmenu(false);
  navOverlay.hidden=false;
  navBackdrop.hidden=false;
  body.classList.add('nav-open');
  navToggle.classList.add('is-active');
  navToggle.setAttribute('aria-expanded','true');
  navToggle.setAttribute('aria-label','Κλείσιμο μενού');
  requestAnimationFrame(function(){
    navOverlay.classList.add('is-active');
    navBackdrop.classList.add('is-active');
  });
  navOverlay.addEventListener('keydown',trapFocus);
  document.addEventListener('keydown',handleOverlayEsc);
  const focusTarget=navOverlay.querySelector('[data-nav-close]')||getFocusableElements()[0];
  if(focusTarget){
    setTimeout(function(){
      focusTarget.focus({preventScroll:true});
    },20);
  }
}

function closeMenu(returnFocus){
  if(returnFocus===undefined){returnFocus=true;}
  if(!navToggle||!navOverlay||!navBackdrop){return;}
  if(navOverlay.hidden&&!menuOpen){
    return;
  }
  menuOpen=false;
  navOverlay.classList.remove('is-active');
  navBackdrop.classList.remove('is-active');
  body.classList.remove('nav-open');
  navToggle.classList.remove('is-active');
  navToggle.setAttribute('aria-expanded','false');
  navToggle.setAttribute('aria-label','Άνοιγμα μενού');
  document.removeEventListener('keydown',handleOverlayEsc);
  navOverlay.removeEventListener('keydown',trapFocus);
  setMobileSubmenu(false);
  const finalize=function(){
    navOverlay.hidden=true;
    navBackdrop.hidden=true;
  };
  if(prefersReducedMotion.matches){
    finalize();
  }else{
    const timer=setTimeout(finalize,320);
    navOverlay.addEventListener('transitionend',function handler(){
      finalize();
      clearTimeout(timer);
      navOverlay.removeEventListener('transitionend',handler);
    });
  }
  if(returnFocus&&navToggle.offsetParent!==null){
    navToggle.focus({preventScroll:true});
  }
}

if(navToggle&&navOverlay&&navBackdrop){
  navToggle.addEventListener('click',function(){
    if(menuOpen){closeMenu();}
    else{openMenu();}
  });
  if(navClose){navClose.addEventListener('click',function(){closeMenu();});}
  navBackdrop.addEventListener('click',function(){closeMenu();});
  if(navOverlay){
    var overlayLinks=navOverlay.querySelectorAll('a.nav-mobile__link, a.nav-mobile__sublink, a.nav-mobile__cta');
    overlayLinks.forEach(function(link){
      link.addEventListener('click',function(){closeMenu();});
    });
  }
  const handleDesktopChange=function(event){
    if(event.matches){closeMenu(false);}
  };
  if(typeof desktopMedia.addEventListener==='function'){
    desktopMedia.addEventListener('change',handleDesktopChange);
  }else if(typeof desktopMedia.addListener==='function'){
    desktopMedia.addListener(handleDesktopChange);
  }
}

if(mobileParent&&mobileItem){
  mobileParent.addEventListener('click',function(){
    const expanded=mobileParent.getAttribute('aria-expanded')==='true';
    setMobileSubmenu(!expanded);
    if(!expanded&&mobileSubLinks.length){
      mobileSubLinks[0].focus({preventScroll:true});
    }
  });
  mobileParent.addEventListener('keydown',function(event){
    if(event.key==='Escape'){
      event.preventDefault();
      setMobileSubmenu(false);
      mobileParent.focus({preventScroll:true});
    }
  });
  mobileSubLinks.forEach(function(link){
    link.addEventListener('keydown',function(event){
      if(event.key==='Escape'){
        event.preventDefault();
        setMobileSubmenu(false);
        mobileParent.focus({preventScroll:true});
      }
    });
  });
}

const desktopParent=document.querySelector('[data-desktop-parent]');
const desktopItem=desktopParent?desktopParent.closest('.nav-item--has-submenu'):null;
const desktopSubLinks=desktopItem?Array.from(desktopItem.querySelectorAll('.submenu__link')):[];
function setDesktopSubmenu(open){
  if(!desktopParent||!desktopItem){return;}
  desktopParent.setAttribute('aria-expanded',String(open));
  desktopItem.classList.toggle('is-open',open);
  desktopSubLinks.forEach(function(link){
    if(open){link.removeAttribute('tabindex');}
    else{link.setAttribute('tabindex','-1');}
  });
}
if(desktopSubLinks.length){setDesktopSubmenu(false);}else if(desktopParent){desktopParent.setAttribute('aria-expanded','false');}

if(desktopParent&&desktopItem){
  const openDesktop=function(){
    if(!desktopMedia.matches){return;}
    setDesktopSubmenu(true);
  };
  const closeDesktop=function(){
    setDesktopSubmenu(false);
  };
  desktopParent.addEventListener('click',function(event){
    event.preventDefault();
    const expanded=desktopParent.getAttribute('aria-expanded')==='true';
    if(expanded){
      closeDesktop();
    }else{
      openDesktop();
      if(desktopSubLinks.length){
        desktopSubLinks[0].focus({preventScroll:true});
      }
    }
  });
  desktopParent.addEventListener('keydown',function(event){
    if(event.key===' '||event.key==='Enter'){
      event.preventDefault();
      const expanded=desktopParent.getAttribute('aria-expanded')==='true';
      if(expanded){
        closeDesktop();
      }else{
        openDesktop();
        if(desktopSubLinks.length){
          desktopSubLinks[0].focus({preventScroll:true});
        }
      }
    }else if(event.key==='Escape'){
      event.preventDefault();
      closeDesktop();
      desktopParent.focus({preventScroll:true});
    }
  });
  desktopItem.addEventListener('mouseenter',openDesktop);
  desktopItem.addEventListener('mouseleave',closeDesktop);
  desktopItem.addEventListener('focusin',openDesktop);
  desktopItem.addEventListener('focusout',function(event){
    if(!desktopItem.contains(event.relatedTarget)){
      closeDesktop();
    }
  });
  desktopSubLinks.forEach(function(link){
    link.addEventListener('keydown',function(event){
      if(event.key==='Escape'){
        event.preventDefault();
        closeDesktop();
        desktopParent.focus({preventScroll:true});
      }
    });
  });
}

const siteHeader=document.querySelector('.site-header');
if(siteHeader){
  const updateHeaderShadow=function(){
    if(window.scrollY>4){
      siteHeader.classList.add('is-scrolled');
    }else{
      siteHeader.classList.remove('is-scrolled');
    }
  };
  updateHeaderShadow();
  window.addEventListener('scroll',updateHeaderShadow,{passive:true});
}

// Active nav state for services
const servicesSection=document.getElementById('services');
const servicesNavLinks=[];
if(desktopParent){servicesNavLinks.push(desktopParent);}
if(mobileParent){servicesNavLinks.push(mobileParent);}
document.querySelectorAll('a.nav__link[href="#services"], a.nav-mobile__link[href="#services"]').forEach(function(link){
  servicesNavLinks.push(link);
});
if('IntersectionObserver'in window&&servicesSection&&servicesNavLinks.length){
  const toggleActive=function(isActive){
    servicesNavLinks.forEach(function(link){
      link.classList.toggle('nav__link--active',isActive);
    });
  };
  const observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      toggleActive(entry.isIntersecting&&entry.intersectionRatio>=0.4);
    });
  },{threshold:0.4});
  observer.observe(servicesSection);
}

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

// Contact widget interactions
(function(){
  const widget=document.querySelector('.contact-widget');
  if(!widget){return;}
  const toggle=widget.querySelector('.contact-widget__toggle');
  const panel=widget.querySelector('.contact-widget__panel');
  if(!toggle||!panel){return;}

  function setState(open){
    toggle.setAttribute('aria-expanded',String(open));
    panel.classList.toggle('is-open',open);
    panel.setAttribute('aria-hidden',String(!open));
    toggle.setAttribute(
      'aria-label',
      open?'Κλείσιμο επιλογών επικοινωνίας':'Άνοιγμα επιλογών επικοινωνίας'
    );
  }

  toggle.addEventListener('click',function(){
    const isOpen=panel.classList.contains('is-open');
    setState(!isOpen);
  });

  document.addEventListener('click',function(event){
    if(!panel.classList.contains('is-open')){return;}
    if(widget.contains(event.target)){return;}
    setState(false);
  });

  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'){
      setState(false);
    }
  });
})();
