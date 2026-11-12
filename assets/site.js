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

  // Escape closes the phone menu.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && location.hash === '#menu') {
      location.hash = '#close';
      var open = document.querySelector('.menu-open');
      if (open) open.focus();
    }
  });
})();
