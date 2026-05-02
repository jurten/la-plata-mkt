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

  function initWorkPreview() {
    var previewMedia = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    var candidates = [
      '#home .grid > .group.cursor-pointer',
      '#work article.group',
      'main > section:nth-of-type(2) article.group'
    ];
    var items = Array.prototype.slice.call(document.querySelectorAll(candidates.join(',')));

    items = items.filter(function(item, index) {
      return items.indexOf(item) === index && item.querySelector('h2, h3');
    });

    if (!items.length) return;

    var previewImages = {
      interior: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ_wE4CBY-A7Ixl2Dt1fsl-xeR2b6ImGV_0mOWOW7sZT0CTb_Ojq-74fuJelTwyzddhpd4OvJQamHsGLUAYvo6PD0qnojZzP1x86d5m7kwM3hnxp8BBtw4wnMHeA5ETigd9tWZpzQ82J5foF1UAzRY-OkCgFl6qxs5AeIM8y_h_Kc0sthlmwLD1brRlJkPzRHDwER9tAi85S5HVPhs2Lme6xHZ25GZxyHfMmeZqckzvj849wdVCyUiBgNM5Uxma79VXfwKl26M-OeO',
      structure: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvfpP6XAdYAcE9gFVN_rFosi2wO2hIFp9vlTGGi1SiCou-E3FsOCldxI7Oy89Tk3k7bFAWw2AYTkmIk20SoWtOPZLc3sas6VlA7l-sMSH_9k76DHIAOExfr53LGNB_VUcUWYIsfH_rxB_r1sCPbE2cq8NDq7gG0FlzJIlCrnPEHo8vCLEtSwMTm3vekRqbcXThTSewqjDd7D0sWdRUYgBeMt0YwBNoiOFAuJmEHKIX85M7M_nwsUvvZeZ8Ccfgyl6T-xYFwQIOR7TH',
      monolith: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLPdd1_ssOWr35vM2m_tLb1TkaqIDHC6uqKGPCIBEhdPC7nhQ3NEAazHBJmE39bedY03ShowDutRkhF_kDoBWbnR5XE9YjzB2MR66YHXuCrUNM4MCF4FK1anaTtDPAxuHVr-XECJt8dqlDi6cKr96Q3dVz8pd1d6QUiihaPrwfpmq0RMfScl8THT-MpHRmEUkwvpUNG2GVaV2YUpvmUqmiy-PlHB7E6O97O9uyrMo3nNy3Gg7ZjZao5aJlWy1C2VLZsAdxTd24OUTT'
    };
    var imageMap = {
      'Aura Residences': previewImages.interior,
      'Nove Gallery': previewImages.structure,
      'Concrete Monolith': previewImages.monolith,
      'Form & Light': previewImages.structure,
      'Glass Canopy': previewImages.interior,
      'Noir Studio': previewImages.monolith,
      'Precision': previewImages.structure,
      'Fluid Dynamics': previewImages.interior
    };
    var isEnglish = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
    var preview = document.createElement('aside');
    var previewImage = document.createElement('img');
    var previewKicker = document.createElement('p');
    var previewTitle = document.createElement('h3');
    var previewMeta = document.createElement('p');
    var media = document.createElement('div');
    var body = document.createElement('div');
    var activeItem = null;

    preview.className = 'studio-work-preview';
    preview.setAttribute('aria-hidden', 'true');
    media.className = 'studio-work-preview__media';
    body.className = 'studio-work-preview__body';
    previewKicker.className = 'studio-work-preview__kicker';
    previewTitle.className = 'studio-work-preview__title';
    previewMeta.className = 'studio-work-preview__meta';

    media.appendChild(previewImage);
    body.appendChild(previewKicker);
    body.appendChild(previewTitle);
    body.appendChild(previewMeta);
    preview.appendChild(media);
    preview.appendChild(body);
    document.body.appendChild(preview);

    function cleanText(node) {
      return node ? node.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function itemTitle(item) {
      return cleanText(item.querySelector('h2, h3'));
    }

    function itemKicker(item) {
      var node = item.querySelector('.font-label-caps.text-label-caps.text-outline');
      if (node) return cleanText(node);
      return isEnglish ? 'Featured Project' : 'Proyecto destacado';
    }

    function itemMeta(item) {
      var year = item.querySelector('h3 + span');
      if (year) return cleanText(year);
      return isEnglish ? 'Case Study' : 'Caso de estudio';
    }

    function itemImage(item, title) {
      var inlineImage = item.querySelector('img');
      if (inlineImage && inlineImage.currentSrc) return inlineImage.currentSrc;
      if (inlineImage && inlineImage.src) return inlineImage.src;
      return imageMap[title] || imageMap['Concrete Monolith'];
    }

    function setPosition(x, y) {
      var margin = 20;
      var gap = 24;
      var cardWidth = preview.offsetWidth || 280;
      var cardHeight = preview.offsetHeight || 260;
      var nextX = x + gap;
      var nextY = y - Math.min(72, cardHeight * 0.35);

      if (nextX + cardWidth + margin > window.innerWidth) {
        nextX = x - cardWidth - gap;
      }

      nextY = Math.min(Math.max(nextY, margin), window.innerHeight - cardHeight - margin);

      preview.style.setProperty('--studio-preview-x', nextX.toFixed(1) + 'px');
      preview.style.setProperty('--studio-preview-y', nextY.toFixed(1) + 'px');
    }

    function setPositionFromItem(item) {
      var rect = item.getBoundingClientRect();
      var x = rect.left + Math.min(rect.width * 0.72, rect.width - 40);
      var y = rect.top + rect.height * 0.5;
      setPosition(x, y);
    }

    function showPreview(item, event) {
      if (!previewMedia.matches) return;

      var title = itemTitle(item);
      if (!title) return;

      activeItem = item;
      previewImage.src = itemImage(item, title);
      previewImage.alt = '';
      previewKicker.textContent = itemKicker(item);
      previewTitle.textContent = title;
      previewMeta.textContent = itemMeta(item);

      if (event && typeof event.clientX === 'number') {
        setPosition(event.clientX, event.clientY);
      } else {
        setPositionFromItem(item);
      }

      item.classList.add('studio-work-preview-source');
      preview.classList.add('is-active');
    }

    function hidePreview(item) {
      if (item) item.classList.remove('studio-work-preview-source');
      if (activeItem && activeItem !== item) activeItem.classList.remove('studio-work-preview-source');
      activeItem = null;
      preview.classList.remove('is-active');
    }

    function syncPreviewTabindex() {
      items.forEach(function(item) {
        if (previewMedia.matches) {
          if (!item.hasAttribute('tabindex')) {
            item.setAttribute('tabindex', '0');
            item.dataset.studioPreviewTabindex = 'true';
          }
          return;
        }

        if (item.dataset.studioPreviewTabindex === 'true') {
          item.removeAttribute('tabindex');
          delete item.dataset.studioPreviewTabindex;
        }
      });
    }

    items.forEach(function(item) {
      item.addEventListener('mouseenter', function(event) {
        showPreview(item, event);
      });

      item.addEventListener('mousemove', function(event) {
        if (!previewMedia.matches || activeItem !== item) return;
        setPosition(event.clientX, event.clientY);
      });

      item.addEventListener('mouseleave', function() {
        hidePreview(item);
      });

      item.addEventListener('focusin', function() {
        showPreview(item);
      });

      item.addEventListener('focusout', function() {
        hidePreview(item);
      });
    });

    function handlePreviewMediaChange() {
      hidePreview(activeItem);
      syncPreviewTabindex();
    }

    if (previewMedia.addEventListener) {
      previewMedia.addEventListener('change', handlePreviewMediaChange);
    } else if (previewMedia.addListener) {
      previewMedia.addListener(handlePreviewMediaChange);
    }

    syncPreviewTabindex();
  }

  initWorkPreview();

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
