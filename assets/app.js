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
  const widget=document.querySelector('[data-contact-widget]');
  if(!widget){return;}
  const fab=widget.querySelector('[data-contact-toggle]');
  const panel=widget.querySelector('[data-contact-panel]');
  const closeBtn=widget.querySelector('[data-contact-close]');
  const backdrop=document.querySelector('[data-contact-backdrop]');
  if(!fab||!panel||!closeBtn||!backdrop){return;}
  const path=(window.location&&window.location.pathname)||'';
  if(/\/(privacy|terms)/.test(path)){
    widget.setAttribute('hidden','');
    widget.classList.add('contact-widget--hidden');
    backdrop.classList.remove('is-active');
    backdrop.setAttribute('hidden','');
    return;
  }
  const sessionKey='fmWidgetOpened';
  const dismissKey='fmWidgetDismissed';
  const mobileBreakpoint=1024;
  let widgetOpen=false;
  let hiddenByContact=false;
  let hiddenByMenu=false;
  let servicesTimer=null;
  let autoOpenPending=false;
  let idleTimer=null;
  let exitIntentBound=false;
  let lastMouseMove=0;
  let autoOpenDone=false;
  let autoSuppressed=false;
  try{autoOpenDone=sessionStorage.getItem(sessionKey)==='1';autoSuppressed=sessionStorage.getItem(dismissKey)==='1';}catch(error){autoOpenDone=false;autoSuppressed=false;}

  const isForceHidden=function(){return hiddenByContact||hiddenByMenu;};
  const getFocusable=function(){
    return Array.from(panel.querySelectorAll(focusableSelectors)).filter(function(el){
      return el.tabIndex>=0&&!el.hasAttribute('disabled');
    });
  };

  const trapWidgetFocus=function(event){
    if(!widgetOpen||event.key!=='Tab'){return;}
    const focusable=getFocusable();
    if(!focusable.length){return;}
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(event.shiftKey){
      if(document.activeElement===first){
        event.preventDefault();
        last.focus({preventScroll:true});
      }
    }else if(document.activeElement===last){
      event.preventDefault();
      first.focus({preventScroll:true});
    }
  };

  const handleWidgetEsc=function(event){
    if(event.key==='Escape'&&widgetOpen){
      event.preventDefault();
      closeWidget({userTriggered:true});
    }
  };

  const finalizeClose=function(){
    panel.setAttribute('hidden','');
    panel.setAttribute('aria-hidden','true');
    backdrop.hidden=true;
  };

  const openWidget=function(options){
    options=options||{};
    if(widgetOpen||isForceHidden()){return;}
    widgetOpen=true;
    panel.removeAttribute('hidden');
    panel.setAttribute('aria-hidden','false');
    backdrop.hidden=false;
    widget.classList.add('contact-widget--open');
    panel.classList.add('is-active');
    backdrop.classList.add('is-active');
    fab.setAttribute('aria-expanded','true');
    document.addEventListener('keydown',handleWidgetEsc);
    panel.addEventListener('keydown',trapWidgetFocus);
    setTimeout(function(){
      const focusTarget=panel.querySelector('[data-contact-focus]')||getFocusable()[0]||closeBtn;
      if(focusTarget){focusTarget.focus({preventScroll:true});}
    },40);
    if(options.auto){
      autoOpenDone=true;
      try{sessionStorage.setItem(sessionKey,'1');}catch(error){}
      updateAutoOpenBindings();
    }
  };

  const disableAutoOpen=function(){
    if(autoSuppressed){return;}
    autoSuppressed=true;
    try{sessionStorage.setItem(dismissKey,'1');}catch(error){}
    updateAutoOpenBindings();
  };

  const closeWidget=function(options){
    options=options||{};
    const returnFocus=options.returnFocus!==false;
    const userTriggered=options.userTriggered===true;
    if(!widgetOpen){
      if(userTriggered){disableAutoOpen();}
      return;
    }
    widgetOpen=false;
    widget.classList.remove('contact-widget--open');
    panel.classList.remove('is-active');
    backdrop.classList.remove('is-active');
    fab.setAttribute('aria-expanded','false');
    document.removeEventListener('keydown',handleWidgetEsc);
    panel.removeEventListener('keydown',trapWidgetFocus);
    panel.setAttribute('aria-hidden','true');
    if(prefersReducedMotion.matches){
      finalizeClose();
    }else{
      const timer=setTimeout(finalizeClose,320);
      panel.addEventListener('transitionend',function handler(){
        finalizeClose();
        clearTimeout(timer);
        panel.removeEventListener('transitionend',handler);
      });
    }
    if(returnFocus&&fab.offsetParent!==null){
      setTimeout(function(){fab.focus({preventScroll:true});},40);
    }
    if(userTriggered){disableAutoOpen();}
  };

  const updateVisibility=function(){
    const shouldHide=isForceHidden();
    widget.classList.toggle('contact-widget--hidden',shouldHide);
    widget.setAttribute('aria-hidden',shouldHide?'true':'false');
    if(shouldHide&&widgetOpen){closeWidget({returnFocus:false});}
  };

  const shouldAutoOpen=function(){
    if(widgetOpen||autoOpenDone||autoSuppressed||autoOpenPending||isForceHidden()){return false;}
    return true;
  };

  const attemptAutoOpen=function(){
    if(!shouldAutoOpen()){return;}
    autoOpenPending=true;
    const trigger=function(){
      autoOpenPending=false;
      if(shouldAutoOpen()){
        openWidget({auto:true});
      }
    };
    if(prefersReducedMotion.matches){
      trigger();
    }else{
      fab.classList.add('pulse');
      setTimeout(function(){
        fab.classList.remove('pulse');
        trigger();
      },600);
    }
  };

  fab.addEventListener('click',function(){
    if(widgetOpen){closeWidget({userTriggered:true});}
    else{openWidget();}
  });

  closeBtn.addEventListener('click',function(){closeWidget({userTriggered:true});});
  backdrop.addEventListener('click',function(){closeWidget({userTriggered:true});});

  const clearIdleTimer=function(){
    if(idleTimer){clearTimeout(idleTimer);idleTimer=null;}
  };

  const scheduleIdleTimer=function(){
    clearIdleTimer();
    if(window.innerWidth>=mobileBreakpoint||autoOpenDone||autoSuppressed){return;}
    idleTimer=setTimeout(function(){
      idleTimer=null;
      if(!hiddenByContact){attemptAutoOpen();}
    },25000);
  };

  const exitIntentHandler=function(event){
    const now=Date.now();
    if(now-lastMouseMove<200){return;}
    lastMouseMove=now;
    if(event.clientY<=8&&event.clientY>=0){
      attemptAutoOpen();
      if(autoOpenDone||autoSuppressed){unbindExitIntent();}
    }
  };

  const bindExitIntent=function(){
    if(exitIntentBound||autoOpenDone||autoSuppressed){return;}
    if(window.innerWidth>=mobileBreakpoint){
      window.addEventListener('mousemove',exitIntentHandler);
      exitIntentBound=true;
    }
  };

  const unbindExitIntent=function(){
    if(!exitIntentBound){return;}
    window.removeEventListener('mousemove',exitIntentHandler);
    exitIntentBound=false;
  };

  const updateAutoOpenBindings=function(){
    if(autoOpenDone||autoSuppressed){
      clearIdleTimer();
      unbindExitIntent();
      return;
    }
    if(window.innerWidth>=mobileBreakpoint){
      clearIdleTimer();
      bindExitIntent();
    }else{
      unbindExitIntent();
      scheduleIdleTimer();
    }
  };

  window.addEventListener('resize',function(){updateAutoOpenBindings();});

  const contactSection=document.getElementById('contact');
  if(contactSection&&'IntersectionObserver' in window){
    const contactObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        const inView=entry.isIntersecting&&entry.intersectionRatio>=0.6;
        if(inView!==hiddenByContact){
          hiddenByContact=inView;
          updateVisibility();
        }
      });
    },{threshold:[0,0.6,1]});
    contactObserver.observe(contactSection);
  }else if(contactSection){
    const checkContact=function(){
      const rect=contactSection.getBoundingClientRect();
      const viewport=window.innerHeight||document.documentElement.clientHeight||0;
      const visible=Math.max(0,Math.min(rect.bottom,viewport)-Math.max(rect.top,0));
      const ratio=rect.height>0?visible/rect.height:0;
      const inView=ratio>=0.6;
      if(inView!==hiddenByContact){
        hiddenByContact=inView;
        updateVisibility();
      }
    };
    window.addEventListener('scroll',checkContact,{passive:true});
    window.addEventListener('resize',checkContact);
    checkContact();
  }

  const servicesSection=document.getElementById('services');
  if(servicesSection&&'IntersectionObserver' in window){
    const servicesObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting&&entry.intersectionRatio>=0.6){
          if(servicesTimer){clearTimeout(servicesTimer);}
          servicesTimer=setTimeout(function(){servicesTimer=null;if(shouldAutoOpen()){attemptAutoOpen();}},2000);
        }else if(servicesTimer){
          clearTimeout(servicesTimer);
          servicesTimer=null;
        }
      });
    },{threshold:[0.6]});
    servicesObserver.observe(servicesSection);
  }else if(servicesSection){
    const checkServices=function(){
      const rect=servicesSection.getBoundingClientRect();
      const viewport=window.innerHeight||document.documentElement.clientHeight||0;
      const visible=Math.max(0,Math.min(rect.bottom,viewport)-Math.max(rect.top,0));
      const ratio=rect.height>0?visible/rect.height:0;
      if(ratio>=0.6){
        if(servicesTimer){clearTimeout(servicesTimer);}
        servicesTimer=setTimeout(function(){servicesTimer=null;if(shouldAutoOpen()){attemptAutoOpen();}},2000);
      }else if(servicesTimer){
        clearTimeout(servicesTimer);
        servicesTimer=null;
      }
    };
    window.addEventListener('scroll',checkServices,{passive:true});
    window.addEventListener('resize',checkServices);
    checkServices();
  }

  const idleEvents=['touchstart','pointerdown','keydown'];
  idleEvents.forEach(function(evt){
    document.addEventListener(evt,function(){
      if(window.innerWidth<mobileBreakpoint&&!autoOpenDone&&!autoSuppressed){scheduleIdleTimer();}
      else{clearIdleTimer();}
    },{passive:true});
  });
  window.addEventListener('scroll',function(){
    if(window.innerWidth<mobileBreakpoint&&!autoOpenDone&&!autoSuppressed){scheduleIdleTimer();}
    else{clearIdleTimer();}
  },{passive:true});

  const menuObserver=new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
      if(mutation.attributeName==='class'){
        const menuOpenNow=body.classList.contains('nav-open');
        if(menuOpenNow!==hiddenByMenu){
          hiddenByMenu=menuOpenNow;
          updateVisibility();
        }
      }
    });
  });
  menuObserver.observe(body,{attributes:true});

  updateVisibility();
  updateAutoOpenBindings();
})();
