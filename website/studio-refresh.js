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

  var typewriterItems = Array.prototype.slice.call(document.querySelectorAll('[data-studio-typewriter]'));

  function typeLine(item) {
    if (item.dataset.studioTyped === 'true') return;
    item.dataset.studioTyped = 'true';

    var fallbackText = item.dataset.studioTypewriterText || item.textContent.replace(/\s+/g, ' ').trim();
    var phrases = (item.dataset.studioPhrases || fallbackText)
      .split('|')
      .map(function(phrase) { return phrase.trim(); })
      .filter(Boolean);
    var phraseIndex = 0;
    var fullText = phrases[phraseIndex] || fallbackText;
    var longestText = phrases.reduce(function(longest, phrase) {
      return phrase.length > longest.length ? phrase : longest;
    }, fullText);
    var ghost = document.createElement('span');
    var live = document.createElement('span');
    var index = 0;
    var direction = 1;

    item.dataset.studioTypewriterText = fallbackText;
    item.setAttribute('aria-label', fullText);
    ghost.className = 'studio-typewriter-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = longestText;
    live.className = 'studio-typewriter-live';
    live.setAttribute('aria-hidden', 'true');
    item.textContent = '';
    item.appendChild(ghost);
    item.appendChild(live);
    item.classList.add('is-typing');

    function writeNext() {
      index += direction;
      live.textContent = fullText.slice(0, index);

      if (direction === 1 && index >= fullText.length) {
        item.setAttribute('aria-label', fullText);
        window.setTimeout(function() {
          direction = -1;
          writeNext();
        }, 4200);
        return;
      }

      if (direction === -1 && index <= 0) {
        window.setTimeout(function() {
          phraseIndex = (phraseIndex + 1) % phrases.length;
          fullText = phrases[phraseIndex];
          direction = 1;
          writeNext();
        }, 1200);
        return;
      }

      var delay = direction === 1 ? 118 : 64;

      if (direction === 1 && /[.,;]/.test(fullText.charAt(index - 1))) {
        delay = 360;
      }

      window.setTimeout(writeNext, delay);
    }

    writeNext();
  }

  var typewriterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      typeLine(entry.target);
      typewriterObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.25 });

  typewriterItems.forEach(function(item) {
    item.dataset.studioTypewriterText = item.textContent.replace(/\s+/g, ' ').trim();
    typewriterObserver.observe(item);
  });

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
