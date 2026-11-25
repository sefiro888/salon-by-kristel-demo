/* Salón by Kristel · luxe.js — un solo script, sin dependencias */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var BASE = d.documentElement.dataset.base || '';
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var sstore = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- intro (una vez por sesión) ---------- */
  var splash = $('.splash');
  if (splash) {
    if (sstore.get('sk-splash') || reduce) { splash.remove(); }
    else {
      var done = function () { splash.classList.add('out'); sstore.set('sk-splash', '1'); setTimeout(function () { splash.remove(); }, 1600); };
      setTimeout(done, 1900); splash.addEventListener('click', done);
    }
  }

  /* ---------- cabecera, progreso, volver arriba ---------- */
  var header = $('.site-header'), prog = $('.progress'), toTop = $('.to-top');
  var ticking = false;
  function onScroll() {
    var y = w.scrollY || root.scrollTop, h = root.scrollHeight - w.innerHeight;
    if (header) header.classList.toggle('solid', y > 40 || w.__forceSolid);
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (toTop) toTop.classList.toggle('on', y > 700);
    var fab = $('.fab-reservar'); if (fab) fab.classList.toggle('on', y > 600);
    var wa = $('.fab-wa'); if (wa) wa.classList.toggle('on', y > 120);
    if (!reduce) parallax(y);
    ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (toTop) toTop.addEventListener('click', function () { w.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- parallax suave (hero y marcas de agua) ---------- */
  var wms = $$('.wm[data-speed]'), heroImg = $('.hero__img');
  function parallax(y) {
    if (heroImg && y < w.innerHeight * 1.2) heroImg.style.translate = '0 ' + (y * 0.14) + 'px';
    var vh = w.innerHeight;
    wms.forEach(function (el) {
      var p = el.parentElement.getBoundingClientRect();
      if (p.bottom < -200 || p.top > vh + 200) return;
      var c = (p.top + p.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.style.translate = '0 ' + c.toFixed(1) + 'px';
    });
  }

  /* ---------- menú: mega + móvil ---------- */
  var items = $$('.nav>li.has-mega');
  function closeAll(except) { items.forEach(function (li) { if (li !== except) { li.classList.remove('open'); var b = $('button', li); if (b) b.setAttribute('aria-expanded', 'false'); } }); }
  items.forEach(function (li) {
    var b = $('button', li), t;
    function open() { clearTimeout(t); closeAll(li); li.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    function close() { t = setTimeout(function () { li.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }, 160); }
    if (fine) { li.addEventListener('mouseenter', open); li.addEventListener('mouseleave', close); }
    b.addEventListener('click', function () { li.classList.contains('open') ? (li.classList.remove('open'), b.setAttribute('aria-expanded', 'false')) : open(); });
    $$('.mega__tab', li).forEach(function (tab) {
      function act() {
        $$('.mega__tab', li).forEach(function (x) { x.classList.toggle('on', x === tab); });
        $$('.mega__panel', li).forEach(function (p) { p.classList.toggle('on', p.id === tab.dataset.t); });
        $$('.mega__img .mi', li).forEach(function (m) { m.classList.toggle('on', m.dataset.t === tab.dataset.t); });
      }
      tab.addEventListener('mouseenter', act); tab.addEventListener('focus', act);
    });
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); setMenu(false); var lb = $('.lightbox.on'); if (lb) lb.classList.remove('on'); } });
  d.addEventListener('click', function (e) { if (!e.target.closest('.nav')) closeAll(); });
  var burger = $('.burger');
  function setMenu(on) { d.body.classList.toggle('menu-open', on); if (burger) { burger.setAttribute('aria-expanded', on); } d.body.style.overflow = on ? 'hidden' : ''; }
  if (burger) burger.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
  $$('.m-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- aparición al hacer scroll ---------- */
  var rvEls = $$('.rv,.rv-l,.rv-r,.img-reveal');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .04, rootMargin: '0px 0px 8% 0px' });
    rvEls.forEach(function (el) { io.observe(el); });
  } else rvEls.forEach(function (el) { el.classList.add('in'); });

  /* ---------- contadores ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    function fmt(v) { return pre + v.toFixed(dec).replace('.', ',') + suf; }
    if (reduce || !('IntersectionObserver' in w)) { el.textContent = fmt(end); return; }
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1800;
      (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(end * e); if (k < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: .6 }); o.observe(el);
  });

  /* ---------- inclinación de tarjetas ---------- */
  if (fine && !reduce) $$('.card').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 6) + 'deg) rotateX(' + ((.5 - y) * 6) + 'deg) translateY(-4px)';
      c.style.setProperty('--mx', (x * 100) + '%'); c.style.setProperty('--my', (y * 100) + '%');
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  /* ---------- comparador antes/después ---------- */
  $$('.cmp').forEach(function (c) {
    var inp = $('input', c);
    function set(v) { c.style.setProperty('--pos', v + '%'); inp.value = v; }
    inp.addEventListener('input', function () { c.dataset.touched = '1'; set(inp.value); });
    set(50);
    if (reduce || !('IntersectionObserver' in w)) return;
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), seq = [50, 14, 86, 50];
      (function step(t) { if (c.dataset.touched) return; var k = (t - t0) / 3200; if (k >= 1) return set(50); var i = Math.min(2, Math.floor(k * 3)), f = k * 3 - i, e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; set(seq[i] + (seq[i + 1] - seq[i]) * e); requestAnimationFrame(step); })(t0);
    }, { threshold: .55 }); o.observe(c);
  });

  /* ---------- reels ---------- */
  var reels = $$('.reel video'), current = null;
  function stopAll(except) { reels.forEach(function (v) { if (v !== except) { v.pause(); v.muted = true; v.parentElement.classList.remove('playing'); } }); }
  $$('.reel').forEach(function (r) {
    var v = $('video', r);
    r.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (!r.classList.contains('playing')) { stopAll(v); v.muted = false; v.currentTime = 0; r.classList.add('playing'); current = v; var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); }); }
      else { v.pause(); r.classList.remove('playing'); }
    });
    r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); r.click(); } });
    if (fine) {
      r.addEventListener('mouseenter', function () { if (v.paused) { v.muted = true; v.play().catch(function () {}); } });
      r.addEventListener('mouseleave', function () { if (!r.classList.contains('playing')) { v.pause(); v.currentTime = 0; } });
    }
    v.addEventListener('ended', function () { r.classList.remove('playing'); });
  });
  if ('IntersectionObserver' in w) { var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) { var v = $('video', e.target); if (v && !v.paused) { v.pause(); e.target.classList.remove('playing'); } } }); }, { threshold: .1 }); $$('.reel').forEach(function (r) { ro.observe(r); }); }

  /* ---------- filtros de precios ---------- */
  $$('[data-filters]').forEach(function (bar) {
    var scope = d.getElementById(bar.dataset.filters);
    $$('.chip', bar).forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.chip', bar).forEach(function (c) { c.classList.toggle('on', c === chip); });
        var f = chip.dataset.f;
        $$('[data-cat]', scope).forEach(function (g) { g.hidden = !(f === 'all' || g.dataset.cat === f); });
      });
    });
  });

  /* ---------- galería con ampliación ---------- */
  var lb = $('.lightbox');
  if (lb) {
    var links = $$('[data-lb]'), idx = 0, im = $('img', lb);
    function show(i) { idx = (i + links.length) % links.length; im.src = links[idx].getAttribute('href'); im.alt = links[idx].dataset.alt || ''; lb.classList.add('on'); }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); show(i); }); });
    $('.x', lb).addEventListener('click', function () { lb.classList.remove('on'); });
    $('.pv', lb).addEventListener('click', function () { show(idx - 1); }); $('.nx', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('on'); });
    d.addEventListener('keydown', function (e) { if (!lb.classList.contains('on')) return; if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  }

  /* ---------- paletas ---------- */
  var themeBtns = $$('.themes button');
  function applyTheme(t) { root.dataset.theme = t; store.set('sk-theme', t); themeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === t); }); }
  themeBtns.forEach(function (b) { b.addEventListener('click', function () { applyTheme(b.dataset.t); }); });
  applyTheme(root.dataset.theme || 'oliva');

  /* ---------- horario: hoy y estado ---------- */
  var H = { 1: [630, 990], 2: [570, 990], 3: [630, 1110], 4: [570, 990], 5: [570, 1110], 6: [540, 780], 0: null };
  var now = new Date(), wd = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  $$('.hours li[data-d]').forEach(function (li) { if (parseInt(li.dataset.d, 10) === wd) li.classList.add('today'); });
  function hm(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  var st = '', dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var h = H[wd];
  if (h && mins >= h[0] && mins < h[1]) st = 'Abierto ahora · cierra a las ' + hm(h[1]);
  else { var n = h && mins < h[0] ? wd : (wd + 1) % 7, k = 0; while (!H[n] && k < 7) { n = (n + 1) % 7; k++; } st = 'Cerrado ahora · abre ' + (n === wd ? 'hoy' : (n === (wd + 1) % 7 ? 'mañana' : 'el ' + dias[n])) + ' a las ' + hm(H[n][0]); }
  $$('[data-open-status]').forEach(function (el) { el.textContent = st; });

  /* ---------- polvo dorado (canvas) en la portada ---------- */
  var cv = $('canvas.dust');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), P = [], W, Hh, vis = true;
    function rs() { W = cv.width = cv.offsetWidth; Hh = cv.height = cv.offsetHeight; }
    rs(); w.addEventListener('resize', rs);
    for (var i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + .6, s: Math.random() * .25 + .06, a: Math.random() * 6.28, o: Math.random() * .5 + .25 });
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
    (function loop() {
      if (vis) {
        ctx.clearRect(0, 0, W, Hh);
        P.forEach(function (p) { p.y -= p.s / 300; p.a += .01; p.x += Math.sin(p.a) * .0006; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
          ctx.beginPath(); ctx.fillStyle = 'rgba(232,205,160,' + p.o * (.6 + .4 * Math.sin(p.a * 2)) + ')'; ctx.arc(p.x * W, p.y * Hh, p.r, 0, 6.28); ctx.fill(); });
      }
      requestAnimationFrame(loop);
    })();
  }


  /* ---------- móvil con reels (vídeo directo) ---------- */
  $$('.phone-app').forEach(function (app) {
    var list = JSON.parse($('script[type="application/json"]', app).textContent);
    var phone = $('.phone', app), v = $('video', app), items = $$('.pl-item', app), bar = $('.bar i', app), idx = 0, wantSound = false;
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
    function load(i, play) {
      idx = (i + list.length) % list.length; var it = list[idx];
      v.poster = it.poster; v.src = it.src; v.muted = !wantSound;
      $('[data-cap]', app).textContent = it.cap; $('[data-fecha]', app).textContent = it.f;
      $('[data-link]', app).href = it.u; $('[data-l]', app).textContent = fmt(it.l); $('[data-c]', app).textContent = fmt(it.c);
      $('[data-n]', app).textContent = (idx + 1) + ' / ' + list.length;
      items.forEach(function (b, k) { b.classList.toggle('on', k === idx); });
      var on = items[idx], box = on && on.parentElement;
      if (box && box.scrollWidth > box.clientWidth + 4) box.scrollTo({ left: on.offsetLeft - 12, behavior: 'smooth' });
      phone.classList.remove('paused'); if (bar) bar.style.width = '0';
      if (play) { var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; wantSound = false; phone.classList.remove('sound'); v.play().catch(function () {}); }); }
    }
    function toggle() { if (v.paused) { v.play().catch(function () {}); phone.classList.remove('paused'); } else { v.pause(); phone.classList.add('paused'); } }
    $('.tap', app).addEventListener('click', toggle);
    $('.snd', app).addEventListener('click', function () { wantSound = !wantSound; v.muted = !wantSound; phone.classList.toggle('sound', wantSound); if (v.paused) { v.play().catch(function () {}); phone.classList.remove('paused'); } });
    items.forEach(function (b, k) { b.addEventListener('click', function () { wantSound = true; phone.classList.add('sound'); load(k, true); }); });
    $('.pv', app).addEventListener('click', function () { load(idx - 1, true); });
    $('.nx', app).addEventListener('click', function () { load(idx + 1, true); });
    v.addEventListener('ended', function () { load(idx + 1, true); });
    v.addEventListener('timeupdate', function () { if (v.duration && bar) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });
    app.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') load(idx + 1, true); if (e.key === 'ArrowLeft') load(idx - 1, true); });
    if (fine && !reduce) {
      var wrap = $('.phone-wrap', app);
      wrap.addEventListener('mousemove', function (e) { var r = wrap.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; phone.style.setProperty('--ry', (x * 14) + 'deg'); phone.style.setProperty('--rx', (-y * 8) + 'deg'); });
      wrap.addEventListener('mouseleave', function () { phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx'); });
    }
    load(0, false);
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!reduce && !phone.classList.contains('paused')) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      else v.pause();
    }, { threshold: .4 }).observe(phone);
  });

  /* ---------- tarjetas sociales: mosaico que cambia solo ---------- */
  $$('.mosaic').forEach(function (m, n) {
    var pool = m.dataset.pool.split(','), tiles = $$('.tile', m), next = tiles.length, k = 0, vis = false;
    pool.forEach(function (name) { var i = new Image(); i.src = BASE + 'assets/images/fotos/' + name + '.webp'; });
    if (reduce) return;
    function tick() {
      if (!vis) return;
      var t = tiles[k % tiles.length], im = $('img', t); k++;
      t.classList.add('swap');
      setTimeout(function () { im.src = BASE + 'assets/images/fotos/' + pool[next % pool.length] + '.webp'; next++; t.classList.remove('swap'); }, 650);
    }
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(m);
    setTimeout(function () { setInterval(tick, 2200); }, n * 900);
  });


  /* ---------- formulario → WhatsApp (sin servidor) ---------- */
  var cf = $('#cform');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = cf.nombre.value.trim(), serv = cf.servicio.value, fecha = cf.fecha.value.trim(), msg = cf.mensaje.value.trim();
    var row = cf.nombre.closest('.f'); row.classList.toggle('bad', !nombre);
    if (!nombre) { cf.nombre.focus(); return; }
    var partes = ['Hola Kristel, soy ' + nombre + '.'];
    partes.push(serv ? 'Me gustaría información o cita para: ' + serv + '.' : 'Me gustaría pedir información.');
    if (fecha) partes.push('Fecha o momento: ' + fecha + '.');
    if (msg) partes.push(msg);
    partes.push('(Mensaje enviado desde la web)');
    var url = cf.dataset.wa + '?text=' + encodeURIComponent(partes.join(' '));
    $('[data-ok]', cf).textContent = d.documentElement.lang === 'en' ? 'Opening WhatsApp with your message…' : 'Abriendo WhatsApp con tu mensaje…';
    w.open(url, '_blank', 'noopener');
  });


  /* ---------- portadas conmutables (inicio): 1 Foto · 2 Mosaico · 3 Salvia (valor interno 6) ---------- */
  var hero = $('.hero--multi');
  if (hero) {
    var sw = $$('.cover-switch button', hero);
    function setCover(n, save) {
      n = ({ '1': '1', '2': '2', '3': '6', '6': '6' })[String(n)] || '1';
      hero.dataset.cover = n;
      sw.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === n ? 'true' : 'false'); });
      if (save) store.set('sk-cover', n);
    }
    sw.forEach(function (b) { b.addEventListener('click', function () { setCover(b.dataset.c, true); }); });
    var q = new URLSearchParams(location.search).get('portada');
    setCover(q || store.get('sk-cover') || '1', !!q);
  }

  /* ---------- WhatsApp vivo: invitación según la sección ---------- */
  var dock = $('.wa-dock');
  if (dock) {
    var tip = $('.wa-tip', dock), tipT = $('.wa-tip__t', dock), items = {}, cur = null, tShow, tHide, count = 0;
    $$('.wa-tips li', dock).forEach(function (li) { items[li.dataset.k] = li; });
    var pageKey = document.body.dataset.page || 'hola';
    var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
    count = parseInt(ss.get('sk-wa-n') || '0', 10);
    function hideTip() { clearTimeout(tHide); tip.classList.remove('on'); }
    function showTip() {
      if (ss.get('sk-wa-x') || count >= 5 || !items[cur] || cur === 'none') return;
      tipT.textContent = items[cur].textContent; tip.classList.add('on'); count++; ss.set('sk-wa-n', String(count));
      var f = $('.fab-wa', dock); if (f) { f.classList.remove('ring'); void f.offsetWidth; f.classList.add('ring'); }
      clearTimeout(tHide); tHide = setTimeout(hideTip, 9000);
    }
    function setCur(k) {
      if (!items[k]) k = items[pageKey] ? pageKey : 'hola';
      if (k === cur) return;
      cur = k; hideTip(); clearTimeout(tShow);
      var href = dock.dataset.wa + '?text=' + encodeURIComponent(items[k].dataset.m);
      $$('.js-wa').forEach(function (a) { a.href = href; });
      tShow = setTimeout(showTip, count ? 3500 : 6000);
    }
    $('.wa-tip__x', dock).addEventListener('click', function () { ss.set('sk-wa-x', '1'); hideTip(); });
    setCur(pageKey);
    if ('IntersectionObserver' in w) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setCur(e.target.dataset.tip || pageKey); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      $$('main section').forEach(function (s) { io.observe(s); });
    }
  }

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
  onScroll();
})();
