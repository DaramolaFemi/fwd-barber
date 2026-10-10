import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const progress = document.querySelector('.reading-progress span');
const menuToggle = document.querySelector('.menu-toggle');
const bookingDialog = document.querySelector('#booking-dialog');
const bookingService = document.querySelector('#booking-service');
const bookingNote = document.querySelector('#booking-note');
const bookingStatus = document.querySelector('#booking-status');
const bookingForm = document.querySelector('#booking-form');
const studioEmail = document.documentElement.dataset.bookingEmail?.trim();
let lenis;

if (!reducedMotion) {
  lenis = new Lenis({ duration: 1.15, anchors: true, smoothWheel: true, touchMultiplier: 1.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function updateScrollChrome() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
  gsap.set(progress, { scaleX: maxScroll > 0 ? window.scrollY / maxScroll : 0 });
}

window.addEventListener('scroll', updateScrollChrome, { passive: true });
window.addEventListener('resize', updateScrollChrome);
updateScrollChrome();

function closeMenu() {
  header.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  menuToggle.textContent = 'Menu';
}

menuToggle.addEventListener('click', () => {
  const isOpen = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  menuToggle.textContent = isOpen ? 'Close' : 'Menu';
});

document.querySelectorAll('.primary-nav a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

function openBooking(service) {
  closeMenu();
  if (service) bookingService.value = service;
  bookingStatus.textContent = '';
  bookingDialog.showModal();
  lenis?.stop();
}

document.querySelectorAll('[data-open-booking]').forEach((button) => {
  button.addEventListener('click', () => openBooking());
});

document.querySelectorAll('[data-service]').forEach((button) => {
  button.addEventListener('click', () => openBooking(button.dataset.service));
});

document.querySelector('.dialog-close').addEventListener('click', () => bookingDialog.close());
bookingDialog.addEventListener('close', () => lenis?.start());
bookingDialog.addEventListener('click', (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  const lines = [
    `FWD/01 cut request: ${bookingService.value}`,
    bookingNote.value.trim() && `A note from me: ${bookingNote.value.trim()}`,
  ].filter(Boolean);
  const message = lines.join('\n');

  if (studioEmail) {
    const subject = encodeURIComponent(`Cut request — ${bookingService.value}`);
    window.location.href = `mailto:${studioEmail}?subject=${subject}&body=${encodeURIComponent(message)}`;
    bookingStatus.textContent = 'Your email draft is ready.';
    return;
  }

  try {
    if (navigator.share) {
      await navigator.share({ title: 'FWD/01 cut request', text: message });
      bookingStatus.textContent = 'Your request is ready to send to the studio.';
    } else {
      await navigator.clipboard.writeText(message);
      bookingStatus.textContent = 'Your cut request is copied. Share it with the studio to arrange a time.';
    }
  } catch (error) {
    if (error.name !== 'AbortError') bookingStatus.textContent = message;
  }
});

if (!reducedMotion) {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-media img', { scale: 1.09, duration: 1.8 })
    .from('.site-header > *', { y: -14, autoAlpha: 0, duration: .65, stagger: .07 }, .05)
    .from('.hero-eyebrow', { y: 15, autoAlpha: 0, duration: .7 }, .25)
    .from('.hero h1 .title-clip > span', { yPercent: 112, duration: 1.1, stagger: .11 }, .35)
    .from('.hero-copy-row', { y: 25, autoAlpha: 0, duration: .8 }, .9)
    .from('.hero-bottom', { autoAlpha: 0, duration: .8 }, 1);

  const media = document.querySelector('.hero-media img');
  const hero = document.querySelector('.hero');
  const moveX = gsap.quickTo(media, 'x', { duration: 1.2, ease: 'power2.out' });
  const moveY = gsap.quickTo(media, 'y', { duration: 1.2, ease: 'power2.out' });
  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    moveX((event.clientX / hero.clientWidth - .5) * 15);
    moveY((event.clientY / hero.clientHeight - .5) * 10);
  });
  hero.addEventListener('pointerleave', () => { moveX(0); moveY(0); });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 701px)', () => {
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', scrub: 1, pin: true, anticipatePin: 1 },
    })
      .to('.hero-media img', { scale: 1.2, xPercent: -2, ease: 'none' }, 0)
      .to('.hero-content', { y: -95, autoAlpha: 0, ease: 'none' }, .18)
      .to('.hero-bottom', { autoAlpha: 0, ease: 'none' }, .27)
      .to('.hero-frame', { autoAlpha: 0, ease: 'none' }, .27);
  });

  mm.add('(min-width: 981px)', () => {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.interlude',
        start: 'top top',
        end: '+=180%',
        scrub: 1.15,
        pin: true,
        anticipatePin: 1,
      },
    })
      .fromTo('.interlude-media',
        { rotationY: -26, rotationX: 7, x: 140, z: -180, scale: .84 },
        { rotationY: 0, rotationX: 0, x: 0, z: 0, scale: 1, duration: 1 }, 0)
      .fromTo('.interlude-content',
        { x: -28, z: -65, rotationY: 5, autoAlpha: .55 },
        { x: 0, z: 0, rotationY: 0, autoAlpha: 1, duration: .48 }, .07)
      .to('.interlude-media',
        { rotationY: 13, rotationX: -3, x: -65, z: 120, scale: 1.07, duration: .55 }, 1.03)
      .to('.interlude-content',
        { x: -20, z: 35, autoAlpha: 0, duration: .42 }, 1.14);

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.finale',
        start: 'top top',
        end: '+=130%',
        scrub: 1.1,
        pin: true,
        anticipatePin: 1,
      },
    })
      .fromTo('.finale-media',
        { rotationY: 24, rotationX: 5, x: -125, z: -190, scale: .85 },
        { rotationY: 0, rotationX: 0, x: 0, z: 0, scale: 1, duration: 1 }, 0)
      .fromTo('.finale-content',
        { x: 75, z: 135, rotationY: -7, autoAlpha: 1 },
        { x: 0, z: 70, rotationY: 0, autoAlpha: 1, duration: .5 }, .07)
      .to('.finale-media',
        { rotationY: -8, x: 26, z: 70, scale: 1.04, duration: .42 }, 1.01);
  });

  mm.add('(max-width: 980px)', () => {
    for (const section of ['interlude', 'finale']) {
      gsap.fromTo(`.${section}-media img`, { scale: 1.11 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: `.${section}`, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
      gsap.from(`.${section}-content > *`, {
        y: 34, autoAlpha: 0, duration: .9, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: `.${section}`, start: 'top 70%' },
      });
    }
  });

  gsap.fromTo('.craft-media img', { scale: 1.16 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.craft', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
  });
  gsap.from('.craft-content > *', {
    y: 35, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .11,
    scrollTrigger: { trigger: '.craft', start: 'top 66%' },
  });
  gsap.from('.services-heading > *', {
    y: 45, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .1,
    scrollTrigger: { trigger: '.services', start: 'top 75%' },
  });
  gsap.from('.service', {
    y: 38, autoAlpha: 0, duration: .8, ease: 'power3.out', stagger: .09,
    scrollTrigger: { trigger: '.service-list', start: 'top 80%' },
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
