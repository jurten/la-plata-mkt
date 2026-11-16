// Astro lifecycle adapter for the user-supplied React Bits WarpText shader.
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { vertex, fragment } from './warp-text-shaders';

for (const container of document.querySelectorAll<HTMLElement>('[data-warp-text]')) {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const forced = matchMedia('(forced-colors: active)');
 const heading = container.querySelector<HTMLHeadingElement>('h1')!;
 let renderer: Renderer;
 try { renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: true, dpr: Math.min(devicePixelRatio, 2) }); }
 catch { continue; }
 const gl = renderer.gl;
 const canvas = gl.canvas as HTMLCanvasElement;
 canvas.setAttribute('aria-hidden', 'true');
 canvas.dataset.warpCanvas = '';
 container.append(canvas);
 gl.clearColor(0,0,0,0);
 const texture = new Texture(gl, { generateMipmaps: false, premultiplyAlpha: true, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
 const clicks = Array.from({ length: 4 }, () => [0.5,0.5,0,0]);
 const uniforms = {
  uTextTexture: { value: texture }, uResolution: { value: new Float32Array([1,1]) },
  uPointer: { value: new Float32Array([.5,.5]) }, uPointerActive: { value: 0 },
  uTime: { value: 0 }, uWarpStrength: { value: .08 }, uWarpScale: { value: 1.7 },
  uSpeed: { value: .55 }, uPointerInfluence: { value: .42 }, uPointerStrength: { value: .38 },
  uRefraction: { value: .018 }, uChromatic: { value: .35 }, uRipple: { value: 1 },
  uMotion: { value: 1 }, uLens: { value: 0 }, uIntro: { value: 0 },
  uReveal: { value: 1 }, uBackdrop: { value: 0 }, uClicks: { value: clicks },
 };
 const program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false, uniforms });
 const geometry = new Triangle(gl);
 const mesh = new Mesh(gl, { geometry, program });
 let frame = 0, visible = true, ready = false, lost = false, time = 0, last = 0, slot = 0;
 const pointer = { x: .5, y: .5, tx: .5, ty: .5, active: 0, target: 0 };
 const render = () => {
  if (!ready || lost) return;
  renderer.render({ scene: mesh });
  container.setAttribute('data-warp-ready', '');
 };
 async function rasterize() {
  await document.fonts.ready;
  if (lost) return;
  const rect = container.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  renderer.setSize(rect.width, rect.height);
  uniforms.uResolution.value.set([rect.width, rect.height]);
  const dpr = Math.min(devicePixelRatio,2);
  const image = document.createElement('canvas');
  image.width = Math.ceil(rect.width*dpr); image.height = Math.ceil(rect.height*dpr);
  const ctx = image.getContext('2d')!;
  ctx.scale(dpr,dpr);
  ctx.fillStyle = getComputedStyle(container).color;
  ctx.textBaseline = 'alphabetic';
  // Rasterise each live DOM line, preserving the left/right/centre composition.
  for (const line of heading.querySelectorAll(':scope > span')) {
   const style = getComputedStyle(line), bounds = line.getBoundingClientRect();
   const size = parseFloat(style.fontSize), tracking = parseFloat(style.letterSpacing) || 0;
   ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
   const text = line.textContent!.trim();
   const chars = Array.from(text);
   const width = chars.reduce((sum,c)=>sum+ctx.measureText(c).width,0)+tracking*(chars.length-1);
   let x = bounds.left-rect.left;
   if (style.textAlign==='right') x += bounds.width-width;
   if (style.textAlign==='center') x += (bounds.width-width)/2;
   const metrics = ctx.measureText(text);
   const y = bounds.top-rect.top+(bounds.height+metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)/2;
   for (const char of chars) { ctx.fillText(char,x,y); x += ctx.measureText(char).width+tracking; }
  }
  texture.image=image; texture.needsUpdate=true; ready=true; render();
 }
 function loop(now: number) {
  frame=0;
  if (!visible || document.hidden || reduced.matches || forced.matches || lost) return;
  const dt = Math.min((now-last)/1000,.05); last=now; time+=dt;
  const engaged = pointer.target>0;
  const driftX=.5+Math.sin(time*.33)*.12, driftY=.5+Math.cos(time*.27)*.10;
  const follow=1-Math.exp(-dt/(engaged?.13:.47));
  pointer.x+=((engaged?pointer.tx:driftX)-pointer.x)*follow;
  pointer.y+=((engaged?pointer.ty:driftY)-pointer.y)*follow;
  pointer.active+=((engaged?1:.2)-pointer.active)*(1-Math.exp(-dt/.27));
  uniforms.uPointer.value.set([pointer.x,pointer.y]);
  uniforms.uPointerActive.value=pointer.active;
  uniforms.uTime.value=time;
  for (const click of clicks) { if(click[3]>0) {click[2]+=dt;if(click[2]>1.6)click[3]=0;} }
  render();frame=requestAnimationFrame(loop);
 }
 function resume() {
  cancelAnimationFrame(frame);frame=0;last=performance.now();
  if (reduced.matches || forced.matches) { uniforms.uMotion.value=0; uniforms.uPointerActive.value=0;uniforms.uTime.value=0;for(const c of clicks)c[3]=0;render();return; }
  uniforms.uMotion.value=1;
  if(visible&&!document.hidden&&!lost)frame=requestAnimationFrame(loop);
 }
 container.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=container.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width;pointer.ty=1-(e.clientY-r.top)/r.height;pointer.target=1;});
 container.addEventListener('pointerleave',()=>{pointer.target=0;});
 container.addEventListener('pointerdown',e=>{if(reduced.matches)return;const r=container.getBoundingClientRect();const c=clicks[slot++%4];c[0]=(e.clientX-r.left)/r.width;c[1]=1-(e.clientY-r.top)/r.height;c[2]=0;c[3]=1;});
 canvas.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(frame);container.removeAttribute('data-warp-ready');canvas.hidden=true;});
 const resize = new ResizeObserver(()=>{void rasterize();});resize.observe(container);
 const observer = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();});observer.observe(container);
 document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);forced.addEventListener('change',resume);
 void rasterize();resume();
}
