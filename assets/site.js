// Ragnar site. Every page works without this file.
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Looping clips play only while they are on screen.
  var loops = [].slice.call(document.querySelectorAll('video[loop]'));
  if (loops.length && !still && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
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
