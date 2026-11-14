(function () {
  var el = document.querySelector('model-viewer');
  if (!el) return;
  var done = false;
  function load() {
    if (done) return;
    done = true;
    var s = document.createElement('script');
    s.type = 'module';
    s.src = 'assets/js/model-viewer.min.js';
    document.head.appendChild(s);
  }
  if (!('IntersectionObserver' in window)) { load(); return; }
  var io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) { load(); io.disconnect(); }
  }, { rootMargin: '600px 0px' });
  io.observe(el);
})();
