// Ragnar site. Every page works without this file.
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Looping clips play only while they are on screen, and each has a pause button.
  var loops = [].slice.call(document.querySelectorAll('video[loop]'));
  function run(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  loops.forEach(function (v) {
    v.held = still;
    var b = v.parentNode.querySelector('.vt');
    if (!b) return;
    b.textContent = still ? 'Play' : 'Pause';
    b.hidden = false;
    b.addEventListener('click', function () {
      v.held = !v.held;
      b.textContent = v.held ? 'Play' : 'Pause';
      if (v.held) v.pause(); else run(v);
    });
  });
  if (loops.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!e.target.held) run(e.target); }
        else e.target.pause();
      });
    }, { rootMargin: '120px 0px' });
    loops.forEach(function (v) { io.observe(v); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) loops.forEach(function (v) { v.pause(); });
    });
  }

  // Every robot's eye light follows the pointer, looks around when nobody points, and blinks on its own rhythm.
  var eyes = [].slice.call(document.querySelectorAll('.dwg .eye[data-cx]'));
  if (eyes.length && !still) {
    var quiet = 0;
    var reach = function () { return Math.max(260, Math.min(520, window.innerWidth * 0.3)); };
    var bots = eyes.map(function (eye) {
      var svg = eye.ownerSVGElement, n = function (a) { return parseFloat(eye.getAttribute(a)); };
      var CX = n('data-cx'), CY = n('data-cy'), HX = n('data-hx'), RANGE = n('data-range');
      var pos = 0, goal = 0, lid = 1, ticking = false;
      var put = function () {
        eye.setAttribute('transform', 'translate(' + (CX + pos).toFixed(1) + ' ' + CY + ') scale(1 ' + lid.toFixed(2) + ') translate(' + (-CX) + ' ' + (-CY) + ')');
      };
      var glide = function () {
        pos += (goal - pos) * 0.15; put();
        if (Math.abs(goal - pos) > 0.3) requestAnimationFrame(glide); else ticking = false;
      };
      var look = function (v) {
        goal = Math.max(-RANGE, Math.min(0, v));
        if (!ticking) { ticking = true; requestAnimationFrame(glide); }
      };
      var blink = function () {
        var t0 = 0;
        var step = function (t) {
          if (!t0) t0 = t;
          var k = (t - t0) / 180;
          lid = k >= 1 ? 1 : Math.max(0.12, Math.abs(1 - 2 * k));
          put();
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        setTimeout(blink, 2600 + Math.random() * 4200);
      };
      setTimeout(blink, 1200 + Math.random() * 2400);
      return {
        at: function (x) {
          var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
          var hx = r.left + (HX - vb.x) / vb.width * r.width;
          look((Math.max(-1, Math.min(1, (x - hx) / reach())) - 1) / 2 * RANGE);
        },
        wander: function () { look(-Math.random() * RANGE); }
      };
    });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      quiet = Date.now();
      bots.forEach(function (b) { b.at(e.clientX); });
    }, { passive: true });
    setInterval(function () {
      if (Date.now() - quiet > 4000) bots.forEach(function (b) { if (Math.random() < 0.7) b.wander(); });
    }, 2600);
  }

  // The lineup rolls in once, the first time it comes into view.
  var fam = document.querySelector('.fam-fig');
  if (fam && !still && 'IntersectionObserver' in window) {
    fam.classList.add('pre');
    var fio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { fam.classList.add('in'); fio.disconnect(); }
    }, { threshold: 0.3 });
    fio.observe(fam);
  }

  // Escape closes the phone menu.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && location.hash === '#menu') {
      location.hash = '#close';
      var open = document.querySelector('.menu-open');
      if (open) open.focus();
    }
  });
})();
