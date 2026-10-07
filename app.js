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

  gsap.from('.interlude p', {
    y: 70, autoAlpha: 0, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.interlude', start: 'top 80%' },
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
  gsap.from('.finale h2 > span', {
    yPercent: 45, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .13,
    scrollTrigger: { trigger: '.finale', start: 'top 70%' },
  });
  gsap.to('.finale-orbit', {
    rotate: 65, ease: 'none',
    scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom top', scrub: 1 },
  });
}
