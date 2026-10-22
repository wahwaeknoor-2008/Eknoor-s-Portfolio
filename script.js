(() => {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = motionQuery.matches;
  const menuButton = document.querySelector('#menu-button');
  const nav = document.querySelector('#site-nav');
  const progressBar = document.querySelector('#progress-bar');
  const navLinks = [...document.querySelectorAll('.site-nav a')];

  function closeMenu() {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (nav.classList.contains('open') && event.target && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  function updateProgress() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
    progressBar.style.transform = `scaleX(${progress / 100})`;
  }

  let progressFrame = 0;
  function scheduleProgress() {
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(() => {
      progressFrame = 0;
      updateProgress();
    });
  }

  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });
  updateProgress();

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px' });
    document.documentElement.classList.add('motion-ready');
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const handleMotionPreferenceChange = (event) => {
    if (!event.matches) return;
    document.documentElement.classList.remove('motion-ready');
    revealItems.forEach((item) => item.classList.add('in-view'));
    document.querySelectorAll('.orbit-card, .magnetic').forEach((item) => { item.style.transform = ''; });
  };
  if (typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', handleMotionPreferenceChange);
  else motionQuery.addListener(handleMotionPreferenceChange);

  const sections = document.querySelectorAll('main > section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-37% 0px -54% 0px', threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  const numbers = document.querySelectorAll('[data-count]');
  function animateNumber(element) {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    if (motionQuery.matches) {
      element.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 900;
    const update = (now) => {
      if (motionQuery.matches) {
        element.textContent = `${target}${suffix}`;
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const numberObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .7 });
    numbers.forEach((number) => numberObserver.observe(number));
  }

  if (!reducedMotion) {
    const sparkles = document.querySelector('#sparkles');
    const positions = [[15,20],[74,15],[83,55],[19,70],[52,11],[63,82]];
    positions.forEach(([left, top], index) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.textContent = index % 2 ? '·' : '✦';
      sparkle.style.left = `${left}%`;
      sparkle.style.top = `${top}%`;
      sparkle.style.animationDelay = `${index * -.48}s`;
      sparkles.appendChild(sparkle);
    });

    const orbitCard = document.querySelector('.orbit-card');
    let tiltFrame = 0;
    let pendingPointer = null;
    orbitCard.addEventListener('pointermove', (event) => {
      if (motionQuery.matches || event.pointerType === 'touch') return;
      pendingPointer = event;
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(() => {
        tiltFrame = 0;
        if (!pendingPointer || motionQuery.matches) return;
        const rect = orbitCard.getBoundingClientRect();
        const x = (pendingPointer.clientX - rect.left) / rect.width - .5;
        const y = (pendingPointer.clientY - rect.top) / rect.height - .5;
        orbitCard.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
        pendingPointer = null;
      });
    });
    orbitCard.addEventListener('pointerleave', () => {
      pendingPointer = null;
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
      orbitCard.style.transform = '';
    });

    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        if (motionQuery.matches || event.pointerType === 'touch') return;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * .12}px, ${y * .16}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }
})();


// Scroll-driven portrait pixel effect. The portrait disperses as you scroll down
// through the hero and reconstructs smoothly as you scroll back up.
(() => {
  const stage = document.getElementById('portrait-stage');
  const image = document.getElementById('portrait-image');
  const frame = document.getElementById('portrait-frame');
  const canvas = document.getElementById('pixel-canvas');
  if (!stage || !image || !frame || !canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dots = [], ready = false, previous = -1;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const ease = v => v*v*(3-2*v);
  function build(){
    const sr=stage.getBoundingClientRect(), ir=image.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(sr.width*dpr); canvas.height=Math.round(sr.height*dpr);
    canvas.style.width=sr.width+'px';canvas.style.height=sr.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    if(!image.naturalWidth||!ir.width||!ir.height)return;
    const off=document.createElement('canvas');off.width=Math.max(1,Math.round(ir.width));off.height=Math.max(1,Math.round(ir.height));
    const oc=off.getContext('2d',{willReadFrequently:true});oc.drawImage(image,0,0,off.width,off.height);
    let data;try{data=oc.getImageData(0,0,off.width,off.height).data}catch(_){return}
    dots=[];const step=innerWidth<600?8:6, ox=ir.left-sr.left, oy=ir.top-sr.top;
    for(let y=0;y<off.height;y+=step)for(let x=0;x<off.width;x+=step){let i=(y*off.width+x)*4,a=data[i+3]/255;if(a<.13)continue;
      let seed=Math.sin(x*12.9898+y*78.233)*43758.5453,r=seed-Math.floor(seed),seed2=Math.sin(x*39.346+y*11.135)*24634.6345,r2=seed2-Math.floor(seed2),ang=r*Math.PI*2,dist=45+r2*Math.max(sr.width*.42,120);
      dots.push({x:ox+x,y:oy+y,s:step*(.5+a*.7),c:`rgba(${data[i]},${data[i+1]},${data[i+2]},${a})`,dx:Math.cos(ang)*dist+(r-.5)*45,dy:Math.sin(ang)*dist-25-r2*95,rot:(r-.5)*2,phase:r2*Math.PI*2});
    }ready=true;paint(0);
  }
  function paint(progress){if(!ready)return;const sr=stage.getBoundingClientRect(),p=ease(progress);ctx.clearRect(0,0,sr.width,sr.height);
    for(const d of dots){let x=d.x+d.dx*p,y=d.y+d.dy*p+Math.sin(d.phase+p*5)*8*p,s=d.s*(1-p*.2);ctx.save();ctx.globalAlpha=1-p*.1;ctx.translate(x,y);ctx.rotate(d.rot*p);ctx.fillStyle=d.c;ctx.fillRect(-s/2,-s/2,s,s);ctx.restore()}
  }
  function update(){if(reduceMotion||!ready)return;const r=stage.getBoundingClientRect(),raw=(innerHeight*.78-r.top)/(innerHeight*.72),p=clamp(raw,0,1);if(Math.abs(p-previous)<.012)return;previous=p;
    stage.classList.toggle('is-dispersing',p>.015);frame.style.opacity=String(1-ease(p));paint(p);
  }
  if(image.complete&&image.naturalWidth)build();else image.addEventListener('load',build,{once:true});
  addEventListener('scroll',update,{passive:true});addEventListener('resize',()=>{build();update()},{passive:true});addEventListener('load',update,{once:true});
  if(!reduceMotion&&matchMedia('(pointer:fine)').matches){stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;frame.style.transform=`rotateY(${x*4}deg) rotateX(${-y*3}deg)`});stage.addEventListener('pointerleave',()=>frame.style.transform='')}
})();
