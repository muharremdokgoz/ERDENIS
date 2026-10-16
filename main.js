/**
 * ERDENIS Project Webpage — Main Application Script
 * Interactive UI behaviors, smooth navigation, animated stat counters, and clipboard utilities.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAnimatedStats();
    initCopyUrlButton();
    initHeaderScrollEffect();
  });

  // Mobile Navigation Drawer & Smooth Scrolling
  function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
        });
      });
    }

    // Active Navigation Highlight via IntersectionObserver
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window && sections.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, {
        threshold: 0.35,
        rootMargin: '-76px 0px 0px 0px'
      });

      sections.forEach(section => observer.observe(section));
    }
  }

  // Header Scroll Blur Enhancement
  function initHeaderScrollEffect() {
    const header = document.getElementById('site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.style.background = 'rgba(4, 7, 17, 0.96)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.6)';
      } else {
        header.style.background = 'rgba(4, 7, 17, 0.85)';
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  // Animated Stats Counter
  function initAnimatedStats() {
    const statItems = document.querySelectorAll('.stat-number');
    if (!statItems.length) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          statItems.forEach(el => animateValue(el));
        }
      });
    }, { threshold: 0.5 });

    const strip = document.getElementById('stats-strip');
    if (strip) observer.observe(strip);
  }

  function animateValue(element) {
    const rawTarget = element.getAttribute('data-target');
    if (!rawTarget) return;

    const target = parseFloat(rawTarget);
    const duration = 1600;
    const start = 0;
    const startTime = performance.now();
    const originalText = element.textContent;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * easeProgress;

      if (originalText.includes('%')) {
        element.textContent = `${current.toFixed(1)}%`;
      } else if (originalText.includes('<')) {
        element.textContent = `< ${Math.round(current)} ms`;
      } else if (originalText.includes('+')) {
        element.textContent = `${Math.round(current)}+`;
      } else {
        element.textContent = Math.round(current);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = originalText;
      }
    }

    requestAnimationFrame(step);
  }

  // Copy Project URL Button
  function initCopyUrlButton() {
    const btnCopy = document.getElementById('btn-copy-url');
    if (!btnCopy) return;

    btnCopy.addEventListener('click', () => {
      const url = 'https://erdenis.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          btnCopy.textContent = 'Copied!';
          btnCopy.style.background = '#10b981';
          btnCopy.style.color = '#fff';

          setTimeout(() => {
            btnCopy.textContent = 'Copy Link';
            btnCopy.style.background = '';
            btnCopy.style.color = '';
          }, 2400);
        }).catch(() => {
          fallbackCopy(url, btnCopy);
        });
      } else {
        fallbackCopy(url, btnCopy);
      }
    });
  }

  function fallbackCopy(text, button) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = 'Copy Link';
    }, 2000);
  }

})();
