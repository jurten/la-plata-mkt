/** React Bits OptionWheel supplied by the user, adapted to Astro's DOM lifecycle.
 * Keeps the circular layout, exponential smoothing, scroll/drag and snapping.
 * See public/licenses/react-bits-option-wheel.txt.
 */
export function initOptionWheels() {
  document.querySelectorAll<HTMLElement>('[data-option-wheel]').forEach(root => {
    if (root.dataset.owInitialized) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-wheel-option]'));
    if (!items.length) return;
    root.dataset.owInitialized = '';
    const events = new AbortController();
    const { signal } = events;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const forced = matchMedia('(forced-colors: active)');
    const count = items.length;
    const loop = root.dataset.loop === 'true' && count > 1;
    let selected = Math.min(Math.max(Number(root.dataset.selected) || 0, 0), count - 1);
    let position = selected;
    let target = selected;
    let rowH = 80;
    let raf: number | null = null;
    let last = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let drag: { y: number; start: number; id: number } | undefined;
    let moved = false;
    let destroyed = false;
    const canInteract = () => !root.closest('[data-team-locked], [inert]');

    const normalize = (value: number) => ((value % count) + count) % count;
    const layout = () => {
      const tiltRad = 6 * Math.PI / 180;
      const radius = rowH / tiltRad;
      items.forEach((item, index) => {
        let distance = index - position;
        if (loop) {
          distance = normalize(distance);
          if (distance > count / 2) distance -= count;
        }
        const dist = Math.abs(distance);
        const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, distance * tiltRad));
        const x = -radius * (1 - Math.cos(angle));
        const y = radius * Math.sin(angle);
        item.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${(angle * 180 / Math.PI).toFixed(3)}deg)`;
        // Preserve readability of the neighboring names; the supplied blur is toned down.
        item.style.opacity = String(Math.max(0.25, 1 - dist * 0.22));
        item.style.filter = reduced.matches ? 'none' : `blur(${(dist * 0.45).toFixed(2)}px)`;
        item.style.setProperty('--ow-p', String(Math.max(0, 1 - Math.min(dist, 1))));
        item.style.zIndex = String(count - Math.min(count, Math.round(dist)));
      });
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      position += (target - position) * (1 - Math.exp(-dt / 0.2));
      const settled = Math.abs(target - position) < 0.001;
      if (settled) position = target;
      layout();
      raf = settled ? null : requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf != null) cancelAnimationFrame(raf);
      if (forced.matches) { raf = null; return; }
      if (reduced.matches || document.hidden) {
        raf = null;
        position = target;
        layout();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const applyTarget = (value: number, snap = true) => {
      if (!loop) value = Math.min(Math.max(value, 0), count - 1);
      target = snap ? Math.round(value) : value;
      const index = normalize(Math.round(target));
      if (index !== selected) {
        selected = index;
        updateSelection();
        root.dispatchEvent(new CustomEvent('option-wheel:change', {
          bubbles: true, detail: { index, item: items[index].textContent?.trim() },
        }));
      }
      wake();
    };

    function updateSelection() {
      root.dataset.selected = String(selected);
      root.setAttribute('aria-activedescendant', items[selected].id);
      items.forEach((item, index) => {
        item.classList.toggle('option-wheel__item--selected', index === selected);
        item.setAttribute('aria-selected', String(index === selected));
      });
    }

    const measure = () => {
      if (destroyed || forced.matches) return;
      // Long names wrap within the wheel; the row follows the tallest real label.
      const largest = Math.max(...items.map(item => item.offsetHeight));
      const font = parseFloat(getComputedStyle(items[0]).fontSize);
      rowH = Math.max(font * 1.6, largest + 16);
      // Allow for the full rotated label at either endpoint, not just row centers.
      // With three people this keeps every name readable in every selection state.
      const tilt = 6 * Math.PI / 180;
      const distance = loop ? Math.floor(count / 2) : count - 1;
      const angle = Math.min(Math.PI / 2, distance * tilt);
      const travel = rowH / tilt * Math.sin(angle);
      const extent = Math.max(...items.map(item => item.offsetWidth * Math.sin(angle) + item.offsetHeight / 2));
      root.style.setProperty('--ow-height', `${Math.ceil((travel + extent + 12) * 2)}px`);
      layout();
    };

    const configure = () => {
      if (forced.matches) {
        if (raf != null) cancelAnimationFrame(raf);
        raf = null;
        clearTimeout(timer);
        endDrag();
        delete root.dataset.owReady;
        root.style.removeProperty('--ow-height');
        root.removeAttribute('role');
        root.removeAttribute('tabindex');
        root.removeAttribute('aria-label');
        root.removeAttribute('aria-activedescendant');
        items.forEach(item => {
          item.removeAttribute('style');
          item.removeAttribute('role');
          item.removeAttribute('aria-selected');
          item.removeAttribute('tabindex');
        });
        return;
      }
      root.dataset.owReady = '';
      root.setAttribute('role', 'listbox');
      root.tabIndex = root.closest('[data-team-locked]') ? -1 : 0;
      root.setAttribute('aria-disabled', String(!canInteract()));
      root.setAttribute('aria-label', root.dataset.label ?? 'Seleccionar una opción');
      items.forEach(item => { item.setAttribute('role', 'option'); item.tabIndex = -1; });
      updateSelection();
      measure();
      wake();
    };

    document.addEventListener('wheel', event => {
      if (forced.matches || count < 2 || event.ctrlKey || event.deltaY === 0 || root.closest('[data-team-locked], [inert]')) return;
      // Firefox can retain the previous wheel target as a transformed scene exits.
      // Route from the current pointer position, even when event.target is stale.
      const hovered = document.elementFromPoint(event.clientX, event.clientY);
      if (!hovered || !root.contains(hovered)) return;
      // Let the page continue at either end instead of trapping vertical scrolling.
      if (!loop && ((target <= 0 && event.deltaY < 0) || (target >= count - 1 && event.deltaY > 0))) return;
      event.preventDefault();
      if (event.deltaMode !== 0) {
        // Firefox reports mouse-wheel notches in lines. Even one line selects a person.
        clearTimeout(timer);
        applyTarget(Math.round(target) + Math.sign(event.deltaY));
        return;
      }
      const delta = event.deltaY;
      applyTarget(target + Math.max(-1, Math.min(1, delta / Math.min(rowH, 60))), false);
      clearTimeout(timer);
      timer = setTimeout(() => applyTarget(target), 140);
    }, { capture: true, passive: false, signal });

    root.addEventListener('pointerdown', event => {
      if (!canInteract()) {
        if (event.pointerType === 'mouse') event.preventDefault();
        return;
      }
      if (forced.matches || count < 2 || !event.isPrimary || event.button !== 0) return;
      drag = { y: event.clientY, start: target, id: event.pointerId };
      moved = false;
    }, { signal });
    root.addEventListener('dragstart', event => event.preventDefault(), { signal });

    root.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId || !canInteract()) return;
      const dy = event.clientY - drag.y;
      if (!moved && Math.abs(dy) > 5) {
        moved = true;
        root.dataset.owDragging = '';
        root.setPointerCapture(drag.id);
      }
      if (moved) applyTarget(drag.start - dy / rowH, false);
    }, { signal });

    const endDrag = () => {
      if (!drag) return;
      const id = drag.id;
      drag = undefined;
      delete root.dataset.owDragging;
      if (root.hasPointerCapture(id)) root.releasePointerCapture(id);
      if (moved) applyTarget(target);
    };
    window.addEventListener('pointerup', endDrag, { signal });
    root.addEventListener('pointercancel', endDrag, { signal });
    root.addEventListener('lostpointercapture', endDrag, { signal });

    root.addEventListener('click', event => {
      if (!canInteract()) { event.preventDefault(); event.stopPropagation(); return; }
      if (forced.matches) return;
      const item = (event.target as Element).closest<HTMLElement>('[data-wheel-option]');
      if (!item) return;
      event.preventDefault();
      if (moved) { moved = false; return; }
      const index = items.indexOf(item);
      let distance = index - normalize(target);
      if (loop) {
        if (distance > count / 2) distance -= count;
        else if (distance < -count / 2) distance += count;
      }
      applyTarget(target + distance);
      root.focus({ preventScroll: true });
    }, { signal });

    root.addEventListener('keydown', event => {
      if (forced.matches || !canInteract()) return;
      let next: number | undefined;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.round(target) - 1;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.round(target) + 1;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = count - 1;
      if (next === undefined) return;
      event.preventDefault();
      applyTarget(next);
    }, { signal });

    root.addEventListener('option-wheel:step', event => {
      if (!canInteract()) return;
      const delta = (event as CustomEvent<number>).detail;
      applyTarget(Math.round(target) + delta);
    }, { signal });
    document.addEventListener('visibilitychange', wake, { signal });
    reduced.addEventListener('change', wake, { signal });
    forced.addEventListener('change', configure, { signal });
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    configure();
    document.fonts.ready.then(() => { if (!destroyed) measure(); });

    document.addEventListener('astro:before-swap', () => {
      destroyed = true;
      events.abort();
      resize.disconnect();
      clearTimeout(timer);
      if (raf != null) cancelAnimationFrame(raf);
    }, { once: true });
  });
}
