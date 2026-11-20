import { createCircularGallery } from '../lib/circular-gallery-engine.js';

// Render the existing text cards into sharp local textures for the supplied
// WebGL component. Their original HTML remains the accessible source of truth.
function cardImage(card: HTMLElement, index: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 920;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  ctx.fillStyle = index === 6 ? '#1536f1' : '#102355';
  ctx.fillRect(0, 0, 360, 460);
  const display = getComputedStyle(card.querySelector('strong')!).fontFamily;
  const body = getComputedStyle(card).fontFamily;
  const text = (selector: string) => card.querySelector(selector)!.textContent!.trim();
  const wrap = (value: string, x: number, y: number, width: number, line: number) => {
    let row = '';
    for (const word of value.split(/\s+/)) {
      const next = row ? `${row} ${word}` : word;
      if (ctx.measureText(next).width > width && row) {
        ctx.fillText(row, x, y);
        row = word;
        y += line;
      } else row = next;
    }
    ctx.fillText(row, x, y);
    return y + line;
  };
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#b7d7ee';
  ctx.font = `700 64px ${display}`;
  ctx.fillText(text('.system-orbit-number'), 28, 26);
  ctx.fillStyle = '#eef3ff';
  ctx.font = `700 32px ${display}`;
  const headingEnd = wrap(text('strong'), 28, 160, 304, 36);
  ctx.fillStyle = '#d5e3f9';
  ctx.font = `400 22px ${body}`;
  const descriptionEnd = wrap(text('.system-orbit-description'), 28, headingEnd + 12, 304, 29);
  ctx.font = `400 19px ${body}`;
  let y = Math.max(330, descriptionEnd + 20);
  for (const point of card.querySelectorAll('.system-orbit-points > span')) {
    ctx.strokeStyle = '#b7d7ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28, y + 10); ctx.lineTo(39, y + 10);
    ctx.moveTo(35, y + 6); ctx.lineTo(39, y + 10); ctx.lineTo(35, y + 14);
    ctx.stroke();
    y = wrap(point.textContent!.trim(), 48, y, 284, 26) + 4;
  }
  return canvas.toDataURL('image/png');
}

export function createSystemGallery(stage: HTMLElement) {
  const host = stage.querySelector<HTMLElement>('[data-system-gallery]')!;
  const view = host.querySelector<HTMLElement>('[data-gallery-view]')!;
  const list = stage.querySelector<HTMLOListElement>('.system-orbit-concepts')!;
  const buttons = [...list.querySelectorAll<HTMLButtonElement>('.system-orbit-card')];
  const canvas = document.createElement('canvas');
  canvas.className = 'circular-gallery-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  view.prepend(canvas);
  view.append(list);
  list.dataset.galleryList = '';
  stage.dataset.galleryReady = '';
  const select = (index: number) => {
    host.dataset.galleryActive = String(index);
    buttons.forEach((button, i) => {
      button.tabIndex = index === i ? 0 : -1;
      button.setAttribute('aria-label', `Ver ${button.querySelector('strong')!.textContent}, etapa ${i + 1} de 7`);
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  };
  const restore = () => {
    delete stage.dataset.galleryReady;
    delete host.dataset.galleryActive;
    delete list.dataset.galleryList;
    stage.append(list);
    canvas.remove();
    buttons.forEach(button => {
      button.removeAttribute('tabindex');
      button.removeAttribute('aria-current');
      button.setAttribute('aria-label', `Traer ${button.querySelector('strong')!.textContent} al frente`);
    });
  };
  let engine: ReturnType<typeof createCircularGallery>;
  try {
    engine = createCircularGallery(view, {
      items: buttons.map((card, index) => ({ image: cardImage(card, index), text: card.querySelector('strong')!.textContent! })),
      bend: 3, textColor: '#eef3ff', borderRadius: .035,
      font: getComputedStyle(buttons[0].querySelector('strong')!).font,
      scrollSpeed: 2, scrollEase: .05, itemSize: 1.6, itemAspect: 360 / 460,
      gap: .26, wave: .15, fadeEdges: .04, shadow: .25,
      grayscale: false, showTitles: false, snap: true, autoScroll: .65,
      openOnClick: false, intro: true, dpr: Math.min(devicePixelRatio, 2), paused: false,
    }, buttons, select);
  } catch {
    restore();
    return null;
  }
  if (!engine) { restore(); return null; }
  select(0);
  const events = new AbortController();
  const { signal } = events;
  buttons.forEach((button, index) => {
    button.addEventListener('focus', () => engine!.focus(index), { signal });
    button.addEventListener('click', () => engine!.focus(index), { signal });
  });
  return {
    wake: () => engine!.wake(),
    pause: (paused: boolean) => engine!.pause(paused),
    destroy: () => { events.abort(); engine!.destroy(); restore(); },
  };
}
