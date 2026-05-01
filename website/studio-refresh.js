(function() {
  var progress = document.createElement('div');
  progress.className = 'studio-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  function updateProgress() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = 'scaleX(' + Math.min(Math.max(ratio, 0), 1) + ')';
  }

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var revealItems = document.querySelectorAll('main > *, section > div, footer > div');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });

  revealItems.forEach(function(item, index) {
    item.setAttribute('data-studio-reveal', '');
    item.style.transitionDelay = Math.min(index % 3, 2) * 40 + 'ms';

    if (/selected works|trabajos seleccionados/i.test(item.textContent || '')) {
      item.classList.add('studio-selected-works');
    }

    if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
      item.style.transitionDelay = '0ms';
      item.classList.add('is-visible');
      return;
    }

    observer.observe(item);
  });

  var parallaxSelector = [
    '#home [class*="aspect-[21/9]"] img',
    '#about [class*="h-[600px]"] img',
    '#about [class*="aspect-[3/4]"] img',
    '#about [class*="aspect-[4/5]"] img',
    '#about [class*="aspect-[1/1]"] img',
    'main section:first-child [class*="h-[600px]"] img',
    'main section:nth-of-type(3) [class*="aspect-"] img'
  ].join(',');
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll(parallaxSelector));
  parallaxItems = parallaxItems.filter(function(item, index) {
    return parallaxItems.indexOf(item) === index;
  });

  parallaxItems.forEach(function(item) {
    item.classList.add('studio-parallax');
  });

  var parallaxMedia = window.matchMedia('(min-width: 768px)');
  var ticking = false;

  function updateParallax() {
    ticking = false;

    if (!parallaxMedia.matches) {
      parallaxItems.forEach(function(item) {
        item.style.setProperty('--studio-parallax-y', '0px');
      });
      return;
    }

    parallaxItems.forEach(function(item) {
      var rect = item.getBoundingClientRect();
      var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      var clamped = Math.min(Math.max(progress, 0), 1);
      var strength = item.closest('#home') ? 44 : 28;
      var offset = (clamped - 0.5) * strength;
      item.style.setProperty('--studio-parallax-y', offset.toFixed(2) + 'px');
    });
  }

  function requestParallax() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  }

  requestParallax();
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
  window.addEventListener('load', requestParallax);
})();
