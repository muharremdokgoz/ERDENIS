/* ERDENIS: renders the page from data/content.json and data/reports.json */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function load(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  function bindText(c) {
    document.querySelectorAll('[data-t]').forEach(function (n) {
      var v = get(c, n.getAttribute('data-t'));
      if (typeof v === 'string') n.textContent = v;
    });
    document.documentElement.lang = c.lang || 'en';
  }

  function renderNav(c) {
    var nav = $('#nav');
    c.ui.nav.forEach(function (item) {
      var a = el('a', null, item.label);
      a.href = '#' + item.id;
      nav.appendChild(a);
    });
  }

  function renderGoals(c) {
    var ol = $('#goalList');
    c.goals.forEach(function (g) {
      var li = el('li');
      li.appendChild(el('span', null, g));
      ol.appendChild(li);
    });
  }

  function renderTeam(c) {
    var sup = $('#supervisor');
    sup.appendChild(el('p', 'label', c.supervisor.role || c.ui.supervisor));
    sup.appendChild(el('h3', 'name', c.supervisor.name));

    var jury = $('#jury');
    jury.appendChild(el('li', 'label', c.ui.jury));
    c.jury.forEach(function (j) {
      jury.appendChild(el('li', /announced/i.test(j.name) ? 'tba' : '', j.name));
    });

    var list = $('#people');
    c.team.forEach(function (p) {
      var li = el('li', 'person');
      if (p.slug) {
        var img = new Image();
        img.className = 'person-photo';
        img.alt = '';
        img.width = 96; img.height = 96;
        img.loading = 'lazy';
        img.onload = function () { li.insertBefore(img, li.firstChild); };
        img.src = 'assets/team/' + p.slug + '.jpg';
      }
      li.appendChild(el('p', 'pname', p.name));
      if (p.email) {
        var m = el('a', 'pmail', p.email);
        m.href = 'mailto:' + p.email;
        li.appendChild(m);
      }
      if (p.github) {
        var g = el('a', 'pgh', 'GitHub ↗');
        g.href = p.github;
        g.target = '_blank';
        g.rel = 'noopener';
        g.setAttribute('aria-label', p.name + ' on GitHub');
        li.appendChild(g);
      }
      list.appendChild(li);
    });
  }

  function renderReports(c, reports) {
    var ul = $('#reportList');
    reports.forEach(function (r, i) {
      var li = el('li', r.file ? '' : 'is-soon');
      li.appendChild(el('span', 'r-idx', String(i + 1).padStart(2, '0')));
      li.appendChild(el('span', 'r-title', r.title));
      var meta = [r.type, r.date].filter(Boolean).join(' · ');
      li.appendChild(el('span', 'r-meta', meta));
      var act = el('span', 'r-actions');
      if (r.file) {
        var v = el('a', 'btn btn-primary', c.ui.reportsView);
        v.href = r.file; v.target = '_blank'; v.rel = 'noopener';
        v.setAttribute('aria-label', c.ui.reportsView + ': ' + r.title);
        var d = el('a', 'btn', c.ui.reportsDownload);
        d.href = r.file; d.setAttribute('download', '');
        d.setAttribute('aria-label', c.ui.reportsDownload + ': ' + r.title);
        act.appendChild(v); act.appendChild(d);
      } else {
        act.appendChild(el('span', 'r-soon', c.ui.reportsSoon));
      }
      li.appendChild(act);
      ul.appendChild(li);
    });
  }

  function renderFooter(c) {
    var box = $('#footLinks');
    var f = c.footer;
    if (f.repo) {
      var a = el('a', null, f.repoLabel || 'GitHub');
      a.href = f.repo; a.target = '_blank'; a.rel = 'noopener';
      box.appendChild(a);
    }
    if (f.email) {
      var m = el('a', null, f.email);
      m.href = 'mailto:' + f.email;
      box.appendChild(m);
    }
  }

  function initHeader() {
    var header = $('#header'), toggle = $('#menuToggle'), nav = $('#nav');
    var openLabel = toggle.textContent, closeLabel = toggle.getAttribute('data-close') || 'Close';

    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.firstElementChild.textContent = open ? closeLabel : openLabel;
    }
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    // active section in nav
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (a) { a.removeAttribute('aria-current'); });
            if (map[en.target.id]) map[en.target.id].setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
    }
  }

  function initReveal() {
    var targets = document.querySelectorAll('.section .wrap > *, .goals li, .people li, .reports li');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
  }

  Promise.all([load('data/content.json'), load('data/reports.json')])
    .then(function (res) {
      var c = res[0], reports = res[1];
      document.getElementById('menuToggle').setAttribute('data-close', c.ui.menuClose);
      bindText(c);
      renderNav(c);
      renderGoals(c);
      renderTeam(c);
      renderReports(c, reports);
      renderFooter(c);
      initHeader();
      initReveal();
    })
    .catch(function (err) {
      console.error('ERDENIS: could not load content', err);
    });
})();
