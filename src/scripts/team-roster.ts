// Adapted from the user's React Bits FlowingMenu (JavaScript + CSS) source.
// Retains independent spring edges, stretch/magnet, cursor velocity and marquee
// integration. React lifecycle/refs are replaced with Astro DOM ownership.
// See public/licenses/react-bits-flowing-menu.txt.
export function initTeamRosters() {
  document.querySelectorAll<HTMLElement>('[data-team-roster]').forEach(root => {
    if (root.dataset.teamInitialized) return;
    const list = root.querySelector<HTMLElement>('[data-team-list]');
    const section = root.closest<HTMLElement>('#nosotros');
    const gate = root.closest<HTMLElement>('.featured-about');
    const main = root.closest('main');
    const status = root.querySelector<HTMLElement>('[data-team-status]');
    if (!list || !section) return;
    root.dataset.teamInitialized = '';
    const rows = [...list.querySelectorAll<HTMLElement>('[data-team-row]')].map(item => ({
      item, choice: item.querySelector<HTMLAnchorElement>('[data-team-choice]')!,
      band: item.querySelector<HTMLElement>('[data-team-band]')!,
      track: item.querySelector<HTMLElement>('[data-team-track]')!,
      top: 0, height: 0, x: 0, part: 0, spin: 0, covered: false,
    }));
    const settings = { speed: 60, duration: .5, stretch: .6, magnet: .25, followCursor: .4, inset: 18 };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const forced = matchMedia('(forced-colors: active)');
    const touchInput = matchMedia('(hover: none), (pointer: coarse)');
    let scrollProgress: number | null = null;
    let scrollDriven = false;
    const events = new AbortController();
    const { signal } = events;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const band = { top: 0, bottom: 0, vTop: 0, vBottom: 0, toTop: 0, toBottom: 0, lead: 1, shown: false, index: -1, rest: 0 };
    const cursor = { x: 0, y: null as number | null, time: 0, vx: 0 };
    let pointer: {x: number; y: number} | undefined;
    let raf = 0, last = 0, paused = false, destroyed = false;
    const box = root.getBoundingClientRect();
    let visible = box.bottom > 0 && box.top < innerHeight;
    const syncVisibility = () => {
      const bounds = root.getBoundingClientRect();
      visible = bounds.bottom > 0 && bounds.top < innerHeight;
    };
    const locked = () => gate?.hasAttribute('data-team-locked') ?? false;
    const available = () => !destroyed && !locked() && visible && !document.hidden && !paused && !forced.matches && !root.closest('[inert]');
    const inset = (height: number) => Math.min(settings.inset, Math.max(0, height / 2 - 2));
    const mark = () => {
      root.dataset.teamSelected = String(band.index);
      rows.forEach((row, index) => {
        row.item.toggleAttribute('data-current', index === band.index);
        row.choice.setAttribute('aria-pressed', String(index === band.index));
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      Object.assign(band, {top:0,bottom:0,vTop:0,vBottom:0,toTop:0,toBottom:0,lead:1,shown:false,index:-1,rest:0});
      Object.assign(cursor, {x:0,y:null,time:0,vx:0});
      rows.forEach(row => {
        row.x = row.spin = 0; row.covered = false;
        row.band.removeAttribute('style'); row.track.removeAttribute('style');
      });
      if (status) status.textContent='';
      mark();
      root.dataset.teamFlowState = available() ? 'idle' : 'disabled';
    };
    const paint = () => {
      rows.forEach(row => {
        const from = Math.max(band.top, row.top);
        const to = Math.min(band.bottom, row.top + row.height);
        row.covered = band.shown && to - from > row.height * .04;
        row.band.style.visibility = row.covered ? 'visible' : 'hidden';
        if (row.covered) row.band.style.clipPath = `inset(${Math.max(0,band.top-row.top)}px 0 ${Math.max(0,row.top+row.height-band.bottom)}px 0)`;
        row.track.style.transform = `translate3d(${row.x.toFixed(2)}px,0,0)`;
      });
    };
    const frame = (now: number) => {
      raf = 0;
      if (!available()) { reset(); return; }
      const elapsed = clamp((now - last) / 1000, 0, 1 / 20); last = now;
      let busy = false;
      if (band.shown) {
        const current = rows[band.index];
        if (current) {
          const lean = cursor.y === null || reduced.matches ? 0
            : clamp((cursor.y - current.top - current.height / 2) * settings.magnet, -current.height * .18, current.height * .18);
          band.toTop = current.top + inset(current.height) + lean;
          band.toBottom = current.top + current.height - inset(current.height) + lean;
        } else band.toTop = band.toBottom = band.rest;
        const gap = (band.toTop + band.toBottom - band.top - band.bottom) / 2;
        if (Math.abs(gap) > 2) band.lead = gap > 0 ? 1 : -1;
        const omega = Math.PI * 2 / settings.duration;
        const fast = omega * (1 + 1.1 * settings.stretch);
        const slow = omega * (1 - .4 * settings.stretch);
        const zeta = 1 - .3 * settings.stretch;
        const wTop = band.lead > 0 ? slow : fast, wBottom = band.lead > 0 ? fast : slow;
        const steps = Math.max(1, Math.ceil(elapsed / (1 / 240))), dt = elapsed / steps;
        for (let i = 0; i < steps; i++) {
          band.vTop += (-wTop*wTop*(band.top-band.toTop)-2*zeta*wTop*band.vTop)*dt;
          band.vBottom += (-wBottom*wBottom*(band.bottom-band.toBottom)-2*zeta*wBottom*band.vBottom)*dt;
          band.top += band.vTop*dt; band.bottom += band.vBottom*dt;
          if (band.bottom < band.top) { band.top = band.bottom = (band.top+band.bottom)/2; band.vTop = band.vBottom = (band.vTop+band.vBottom)/2; }
        }
        if (Math.abs(band.top-band.toTop)<.1 && Math.abs(band.bottom-band.toBottom)<.1 && Math.abs(band.vTop)<2 && Math.abs(band.vBottom)<2) {
          band.top=band.toTop; band.bottom=band.toBottom; band.vTop=band.vBottom=0;
          if (band.index < 0) band.shown=false;
        } else busy=true;
      }
      cursor.vx *= Math.exp(-elapsed/.3);
      const push=clamp(cursor.vx*settings.followCursor*.55,-1600,1600);
      rows.forEach((row,index) => {
        const goal=row.covered?1:0;
        row.spin+=(goal-row.spin)*(1-Math.exp(-elapsed/.35));
        if (Math.abs(goal-row.spin)<.002) row.spin=goal;
        if (!row.covered && row.spin===0) return;
        busy=true;
        if (row.part>0) {
          row.x+=((index%2?1:-1)*settings.speed+push)*row.spin*elapsed;
          row.x=(((row.x%row.part)+row.part)%row.part)-row.part;
        }
      });
      paint();
      if (busy && !reduced.matches) raf=requestAnimationFrame(frame);
      else if (!band.shown) root.dataset.teamFlowState='idle';
    };
    const kick = () => {
      if (raf || !available() || reduced.matches) return;
      last=performance.now(); raf=requestAnimationFrame(frame);
    };
    const goTo = (index: number, from: 'top'|'bottom'|'center' = 'top', announce=false) => {
      // Hash arrival can precede a queued observer notification. Fresh input
      // uses the current viewport while the observer owns offscreen shutdown.
      syncVisibility();
      if (!available()) return;
      const row=rows[index]; if (!row) return;
      const top=row.top+inset(row.height), bottom=row.top+row.height-inset(row.height);
      if (!band.shown) {
        band.top=band.bottom=from==='bottom'?bottom:from==='center'?(top+bottom)/2:top;
        band.vTop=band.vBottom=0; band.shown=true;
      }
      const shift=(top+bottom-band.top-band.bottom)/2;
      band.lead=Math.abs(shift)>.5?(shift>0?1:-1):from==='bottom'?-1:1;
      band.toTop=top; band.toBottom=bottom; band.index=index;
      mark(); root.dataset.teamFlowState='active';
      if (announce && status) status.textContent=`${row.choice.querySelector('[data-team-current-name]')?.textContent}, ${row.choice.querySelector('[data-team-current-role]')?.textContent}`;
      if (reduced.matches) { band.top=top;band.bottom=bottom;band.vTop=band.vBottom=0;paint(); }
      else kick();
    };
    const release = (toward: 'top'|'bottom'|'center') => {
      if (!band.shown) return;
      if (reduced.matches) {reset();return;}
      band.rest=toward==='top'?band.toTop:toward==='bottom'?band.toBottom:(band.toTop+band.toBottom)/2;
      band.toTop=band.toBottom=band.rest;band.index=-1;cursor.y=null;
      mark();kick();
    };
    const syncScrollSelection = () => {
      if (!touchInput.matches || reduced.matches || scrollProgress === null) {
        if (scrollDriven) reset();
        scrollDriven = false;
        return;
      }
      scrollDriven = true;
      // Keep the rounded 0% and 100% positions completely still.
      if (scrollProgress <= .005 || scrollProgress >= .995) { reset(); return; }
      syncVisibility();
      if (!available()) { reset(); return; }
      const y = scrollProgress * list.offsetHeight;
      const index = rows.findIndex(row => y >= row.top && y < row.top + row.height);
      cursor.y = y;
      if (index >= 0 && index !== band.index) goTo(index, 'center');
      else kick();
    };
    const measure = () => {
      reset();
      rows.forEach(row => {
        row.top=row.item.offsetTop;row.height=row.item.offsetHeight;
        const first=row.track.firstElementChild as HTMLElement;
        row.part=first?.offsetWidth??0;
        const copies=row.part>0?Math.max(2,Math.ceil(list.clientWidth/row.part)+1):3;
        while(row.track.children.length>copies) row.track.lastElementChild?.remove();
        while(row.track.children.length<copies) row.track.append(first.cloneNode(true));
      });
      syncScrollSelection();
    };
    const configure = () => {
      root.toggleAttribute('data-team-ready',!forced.matches);
      section.toggleAttribute('data-team-layout',!forced.matches);
      reset();
      rows.forEach(row => {
        if (forced.matches) {
          for (const name of ['role','aria-pressed','aria-disabled','tabindex']) row.choice.removeAttribute(name);
        } else {
          row.choice.setAttribute('role','button');
          row.choice.setAttribute('aria-disabled',String(locked()));
          row.choice.tabIndex=locked()?-1:0;
        }
      });
      if (locked() && document.activeElement instanceof HTMLElement && root.contains(document.activeElement)) document.activeElement.blur();
      syncScrollSelection();
    };
    rows.forEach((row,index) => {
      row.choice.addEventListener('click',event=>{if(forced.matches)return;event.preventDefault();if(scrollDriven){syncScrollSelection();return;}cursor.y=null;goTo(index,'center',true);},{signal});
      row.choice.addEventListener('focus',()=>{
        if(locked()){row.choice.blur();return;}
        if(scrollDriven){syncScrollSelection();return;}
        cursor.y=null;goTo(index,'top',true);
      },{signal});
      row.choice.addEventListener('blur',event=>{if(!scrollDriven&&!list.contains(event.relatedTarget as Node))release('bottom');},{signal});
      row.choice.addEventListener('keydown',event=>{
        if(locked()||forced.matches)return;
        if(event.key===' '){event.preventDefault();goTo(index,'center',true);}
        else if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key)){
          event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?rows.length-1:clamp(index+(['ArrowDown','ArrowRight'].includes(event.key)?1:-1),0,rows.length-1);
          rows[next].choice.focus({preventScroll:true});
        }
      },{signal});
    });
    document.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||scrollDriven)return;
      const moved=!pointer||pointer.x!==event.clientX||pointer.y!==event.clientY;
      pointer={x:event.clientX,y:event.clientY};
      if(!moved||!(event.target instanceof Element)||!list.contains(event.target))return;
      syncVisibility();
      if(!available())return;
      const now=performance.now(),gap=(now-cursor.time)/1000;
      if(gap>0&&gap<.1){const instant=(event.clientX-cursor.x)/gap;cursor.vx+=(instant-cursor.vx)*(1-Math.exp(-gap/.08));}
      const bounds=list.getBoundingClientRect();
      cursor.x=event.clientX;cursor.time=now;cursor.y=(event.clientY-bounds.top)*list.offsetHeight/bounds.height;
      const index=rows.findIndex(row=>cursor.y!>=row.top&&cursor.y!<row.top+row.height);
      if(index>=0&&index!==band.index)goTo(index,cursor.y<rows[index].top+rows[index].height/2?'top':'bottom');
      else kick();
    },{signal,passive:true});
    list.addEventListener('pointerleave',event=>{
      if(event.pointerType==='touch'||scrollDriven||rows.some(row=>row.choice.matches(':focus-visible')))return;
      const bounds=list.getBoundingClientRect();release(event.clientY<=bounds.top?'top':event.clientY>=bounds.bottom?'bottom':'center');
    },{signal});
    const gateObserver=new MutationObserver(configure);
    window.addEventListener('lpm:team-scroll', event => {
      const detail = (event as CustomEvent<{container: HTMLElement; progress: number | null}>).detail;
      if (!detail.container.contains(root)) return;
      scrollProgress = detail.progress;
      syncScrollSelection();
    }, {signal});
    touchInput.addEventListener('change', syncScrollSelection, {signal});
    if(gate)gateObserver.observe(gate,{attributes:true,attributeFilter:['data-team-locked']});
    if(main)gateObserver.observe(main,{attributes:true,attributeFilter:['inert']});
    const visibility=new IntersectionObserver(entries=>{
      visible=entries[entries.length-1].isIntersecting;
      if(!visible)reset();else {syncScrollSelection();if(available()&&band.index<0)root.dataset.teamFlowState='idle';}
    });
    visibility.observe(root);
    const resize=new ResizeObserver(measure);resize.observe(list);
    reduced.addEventListener('change',()=>{configure();measure();},{signal});
    forced.addEventListener('change',()=>{configure();measure();},{signal});
    document.addEventListener('visibilitychange',()=>{reset();if(!document.hidden)syncScrollSelection();},{signal});
    window.addEventListener('lpm:transmission-pause',event=>{paused=(event as CustomEvent<boolean>).detail;configure();},{signal});
    window.addEventListener('pagehide',reset,{signal});
    configure();measure();
    void document.fonts.ready.then(()=>{if(!destroyed)measure();});
    document.addEventListener('astro:before-swap',()=>{
      destroyed=true;reset();events.abort();gateObserver.disconnect();visibility.disconnect();resize.disconnect();
    },{once:true});
  });
}
