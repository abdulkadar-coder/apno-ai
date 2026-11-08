/* ==========================================================================
   animations.js — progressive enhancement layer
   --------------------------------------------------------------------------
   Libraries: GSAP + ScrollTrigger (https://github.com/greensock/gsap)
              Lenis (https://github.com/darkroomengineering/lenis)
   Effects adapted from react-bits (https://github.com/DavidHDev/react-bits):
     • Magnet          → initMagnet()
     • SpotlightCard   → initSpotlight()
     • TiltedCard      → initTilt()
     • ScrollVelocity  → initMarquee()
   react-bits is a React component library, so the effects are reimplemented
   in vanilla JS to keep this site build-free.

   If any library fails to load, or the visitor prefers reduced motion, this
   file exits early and the IntersectionObserver fallback in index.html takes
   over. Nothing is left hidden.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var saveData = !!(connection && connection.saveData);

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var Lenis = window.Lenis;
  var canAnimate = !!(gsap && ScrollTrigger) && !reduceMotion && !saveData;

  if (!canAnimate) return;

  root.classList.add('has-gsap');
  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------------
     Smooth scrolling with Lenis, synced to ScrollTrigger
     ------------------------------------------------------------------------ */
  function initLenis() {
    if (!Lenis) return null;

    var lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Smooth in-page anchors, matching the CSS scroll-margin-top of 88px.
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#' || link.classList.contains('skip-link')) return;

      var target = document.querySelector(href);
      if (!target) return;

      link.addEventListener('click', function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;

        event.preventDefault();
        lenis.scrollTo(target, { offset: -88, duration: 1.15 });

        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', href);
        }
      });
    });

    // Freeze the page while the dropdown menu is open.
    window.addEventListener('apno:menu', function (event) {
      if (event.detail && event.detail.open) lenis.stop();
      else lenis.start();
    });

    return lenis;
  }

  /* ------------------------------------------------------------------------
     Hero intro — masked line rise (SplitText-style, no plugin)
     ------------------------------------------------------------------------ */
  function initHeroIntro() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return null;

    var lines = hero.querySelectorAll('.hero-line');
    var corners = hero.querySelectorAll('.hero-corner');

    // The hero is excluded from the generic reveal, so show its wrapper first.
    gsap.set(hero, { opacity: 1, y: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(lines,
      { yPercent: 115, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
      {
        yPercent: 0,
        opacity: 1,
        clipPath: 'inset(-20% -10% -20% -10%)',
        duration: 1.15,
        stagger: 0.09
      },
      0);

    tl.fromTo(corners,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 },
      0.55);

    return tl;
  }

  /* ------------------------------------------------------------------------
     Scroll-triggered reveals, replacing the IntersectionObserver fallback
     ------------------------------------------------------------------------ */
  function revealDelay(el) {
    var raw = el.style.getPropertyValue('--reveal-delay');
    if (!raw) return 0;
    var value = parseFloat(raw);
    if (isNaN(value)) return 0;
    return /ms\s*$/.test(raw) ? value / 1000 : value;
  }

  function initReveals() {
    var items = gsap.utils.toArray('.reveal').filter(function (el) {
      return !el.hasAttribute('data-hero');
    });

    gsap.set(items, { opacity: 0, y: 30 });

    items.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: revealDelay(el),
            ease: 'power3.out',
            overwrite: 'auto',
            onComplete: function () { el.classList.add('is-visible'); }
          });
        }
      });
    });

    // A final safety net: anything already on screen becomes visible even if
    // a trigger measured oddly (for example after a late webfont swap).
    window.setTimeout(function () {
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var onScreen = rect.top < window.innerHeight && rect.bottom > 0;
        if (onScreen && parseFloat(getComputedStyle(el).opacity) === 0) {
          el.classList.add('is-visible');
          gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        }
      });
    }, 2500);
  }

  /* ------------------------------------------------------------------------
     Scroll-linked parallax
     ------------------------------------------------------------------------ */
  function initParallax() {
    // yPercent is reserved for the intro, so the hero drift uses y.
    gsap.to('.hero-title', {
      y: -72,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-block',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hero-corner', {
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-block',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.utils.toArray('.banner').forEach(function (banner) {
      var title = banner.querySelector('.banner-title');
      if (!title) return;

      gsap.fromTo(title,
        { yPercent: 14 },
        {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: banner,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
    });

    gsap.fromTo('.footer-wordmark',
      { yPercent: 8 },
      {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.site-footer',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true
        }
      });
  }

  /* ------------------------------------------------------------------------
     SpotlightCard — pointer-following glow on tiles and case media
     ------------------------------------------------------------------------ */
  function initSpotlight() {
    document.querySelectorAll('.specimen-link, .case-media').forEach(function (host) {
      if (host.querySelector('.spotlight-layer')) return;

      host.classList.add('spotlight-host');

      var layer = document.createElement('span');
      layer.className = 'spotlight-layer';
      layer.setAttribute('aria-hidden', 'true');
      host.insertBefore(layer, host.firstChild);

      host.addEventListener('pointermove', function (event) {
        var rect = host.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        host.style.setProperty('--spot-x', x.toFixed(1) + '%');
        host.style.setProperty('--spot-y', y.toFixed(1) + '%');
      });

      host.addEventListener('pointerleave', function () {
        host.style.removeProperty('--spot-x');
        host.style.removeProperty('--spot-y');
      });
    });
  }

  /* ------------------------------------------------------------------------
     TiltedCard — subtle 3D tilt on fine pointers
     ------------------------------------------------------------------------ */
  function initTilt() {
    if (!finePointer) return;

    var targets = document.querySelectorAll('.specimen-link, .case-media');
    if (!targets.length) return;

    root.classList.add('has-tilt');

    targets.forEach(function (el) {
      gsap.set(el, { transformPerspective: 900, transformOrigin: 'center' });

      var rotateX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
      var rotateY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
      var scale = gsap.quickTo(el, 'scale', { duration: 0.45, ease: 'power3' });
      var rect = null;

      el.addEventListener('pointerenter', function () {
        rect = el.getBoundingClientRect();
        scale(1.02);
      });

      el.addEventListener('pointermove', function (event) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateX(-py * 5);
        rotateY(px * 5);
      });

      function reset() {
        rect = null;
        rotateX(0);
        rotateY(0);
        scale(1);
      }

      el.addEventListener('pointerleave', reset);
      el.addEventListener('blur', reset);
    });
  }

  /* ------------------------------------------------------------------------
     Magnet — pills lean toward the pointer
     ------------------------------------------------------------------------ */
  function initMagnet() {
    if (!finePointer) return;

    document.querySelectorAll('.pill').forEach(function (pill) {
      var moveX = gsap.quickTo(pill, 'x', { duration: 0.4, ease: 'power3' });
      var moveY = gsap.quickTo(pill, 'y', { duration: 0.4, ease: 'power3' });

      pill.addEventListener('pointermove', function (event) {
        var rect = pill.getBoundingClientRect();
        var dx = event.clientX - (rect.left + rect.width / 2);
        var dy = event.clientY - (rect.top + rect.height / 2);
        moveX(Math.max(-8, Math.min(8, dx * 0.12)));
        moveY(Math.max(-6, Math.min(6, dy * 0.12)));
      });

      function reset() {
        moveX(0);
        moveY(0);
      }

      pill.addEventListener('pointerleave', reset);
      pill.addEventListener('blur', reset);
    });
  }

  /* ------------------------------------------------------------------------
     ScrollVelocity marquee — speeds up with scroll, pauses on hover
     ------------------------------------------------------------------------ */
  function initMarquee(lenis) {
    var track = document.querySelector('[data-marquee]');
    if (!track) return;

    var tween = gsap.to(track, {
      xPercent: -50,
      duration: 34,
      ease: 'none',
      repeat: -1
    });

    var speed = 1;
    var idleTimer = 0;

    function setSpeed(next, duration) {
      speed = next;
      gsap.to(tween, { timeScale: next, duration: duration, overwrite: true });
    }

    if (lenis) {
      lenis.on('scroll', function (event) {
        var boost = 1 + Math.min(3, Math.abs(event.velocity || 0) * 0.35);
        setSpeed(boost, 0.25);

        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(function () { setSpeed(1, 1.1); }, 180);
      });
    }

    track.addEventListener('pointerenter', function () { setSpeed(0.2, 0.4); });
    track.addEventListener('pointerleave', function () { setSpeed(speed || 1, 0.6); });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  var lenis = initLenis();

  initHeroIntro();
  initReveals();
  initParallax();
  initSpotlight();
  initTilt();
  initMagnet();
  initMarquee(lenis);

  // Late webfont swap changes text heights, so re-measure the triggers.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  // Tells the inline script that the GSAP layer owns the reveals.
  window.__apnoAnimations = true;
})();
