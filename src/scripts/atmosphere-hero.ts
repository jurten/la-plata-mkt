import { SmokeDisplacement } from './smoke-displacement';
import { heroClickShader } from './hero-click-shader';

const hero = document.querySelector<HTMLElement>('.optical-hero');
if (hero) {
 const canvas = hero.querySelector<HTMLCanvasElement>('[data-atmosphere]')!;

 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const forced = matchMedia('(forced-colors: active)');
 const heading = hero.querySelector<HTMLElement>('[data-warp-text]')!;
 const clicks = new Float32Array(16);
 let clickSlot = 0;
 const hasClicks = () => clicks.some((value, index) => index % 4 === 3 && value > 0);
 hero.addEventListener('pointerdown', event => {
  if (reduced.matches || forced.matches || event.button !== 0 || (event.target as Element).closest('a, button, input, textarea, select, summary, label')) return;
  const bounds = canvas.getBoundingClientRect();
  const slot = (clickSlot++ % 4) * 4;
  clicks.set([(event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height, 0, 1], slot);
 });
 let visible = true, frame = 0, time = 0, last = 0, lastDraw = 0;
 const flow = new SmokeDisplacement();
 const pointer = { x: .5, y: .5, lastX: .5, lastY: .5, inside: false, fresh: true };
 let cssWidth = 1, cssHeight = 1, rippleHeight = 1;
 new ResizeObserver(([entry]) => { rippleHeight = Math.max(1,entry.borderBoxSize[0].blockSize); }).observe(heading);
 function releasePointer() { pointer.inside = false; pointer.fresh = true; }
 hero.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reduced.matches) return;
  const bounds = canvas.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / Math.max(1, bounds.width);
  pointer.y = 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height);
  pointer.inside = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1;
  if (pointer.fresh || !pointer.inside) {
   pointer.lastX = pointer.x; pointer.lastY = pointer.y; pointer.fresh = false;
  }
 });
 hero.addEventListener('pointerleave', releasePointer);
 hero.addEventListener('pointercancel', releasePointer);
 window.addEventListener('blur', releasePointer);
 function updateFlow(dt: number) {
  const moved = pointer.inside && (pointer.x !== pointer.lastX || pointer.y !== pointer.lastY);
  if (moved || flow.energy > 0) {
   flow.step(dt, moved ? pointer.lastX : pointer.x, moved ? pointer.lastY : pointer.y, pointer.x, pointer.y, cssWidth, cssHeight);
  }
  pointer.lastX = pointer.x; pointer.lastY = pointer.y;
 }
 const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
 const vertex = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
 const fragment = `precision highp float;
 uniform vec2 res; uniform float clock;
 uniform float rippleHeight;
 uniform sampler2D flowMap; uniform sampler2D noiseMap;
 ${heroClickShader}
 // Avoid sin-based star hashes whose precision varies between mobile GPUs.
 float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
 // The same stored lattice is sampled on every GPU. Hardware interpolation
 // avoids driver-dependent hash rounding at the edges of each smoke cell.
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return texture2D(noiseMap,(i+f+.5)/64.).r;}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.2,3.1);a*=.5;}return v;}
 vec3 field(vec2 uv){
 vec4 flowSample=texture2D(flowMap,uv);
 vec2 displacement=(vec2(dot(flowSample.rg,vec2(65280.,255.)),dot(flowSample.ba,vec2(65280.,255.)))/65535.-.5)*.3;
 // The click wave pushes the same blue field as the cursor's flow map.
 // Stars stay in place: this is a deformation of the smoke, not an overlay.
 vec2 smokeUv=uv-displacement+clickShock(uv,res,rippleHeight).xy;
 float t=clock*.055;vec2 p=smokeUv*2.6;vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));float n=fbm(p+2.5*q+vec2(t,-t));float ribbon=sin(smokeUv.x*3.5+smokeUv.y*4.8+n*4.5-t);
 vec3 col=mix(vec3(.008,.018,.055),vec3(.025,.13,.70),smoothstep(-.5,.85,ribbon));
 col=mix(col,vec3(.38,.61,.87),pow(smoothstep(.60,1.,ribbon),3.)*.8);
 col+=vec3(.12,.035,.24)*pow(n,3.);
 vec2 starUv=uv*vec2(res.x/res.y,1.)*95.;vec2 cell=floor(starUv),f=fract(starUv)-.5;float s=hash(cell);col+=vec3(.55,.7,1.)*(1.-smoothstep(0.,.025,length(f)))*step(.987,s)*.38;
 return col;}
 void main(){vec2 uv=gl_FragCoord.xy/res;gl_FragColor=vec4(field(uv),1.);}`;
 let program: WebGLProgram | null = null;
 let flowTexture: WebGLTexture | null = null;
 let noiseTexture: WebGLTexture | null = null;
 const uniforms: Record<string, WebGLUniformLocation | null> = {};
 if (gl) {
  const shader = (type: number, source: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; };
  const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (vs && fs) { program = gl.createProgram()!; gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) program = null; }
  if (program) {
   gl.useProgram(program); const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW); const p = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
   for (const key of ['res','clock','flowMap','noiseMap','rippleHeight','uClicks[0]']) uniforms[key] = gl.getUniformLocation(program,key);
   const noise = new Uint8Array(64 * 64 * 4);
   let seed = 0x4c504d;
   for (let i = 0; i < noise.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    noise[i] = noise[i + 1] = noise[i + 2] = seed >>> 24;
    noise[i + 3] = 255;
   }
   noiseTexture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,noiseTexture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,noise);
   flowTexture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,flowTexture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,flow.width,flow.height,0,gl.RGBA,gl.UNSIGNED_BYTE,flow.pixels);
  }
 }
 function draw() {
  if (!gl || !program) return;
  gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(uniforms.res,canvas.width,canvas.height); gl.uniform1f(uniforms.clock,time);
  gl.uniform1f(uniforms.rippleHeight,rippleHeight*canvas.height/cssHeight);
  gl.uniform4fv(uniforms['uClicks[0]'],clicks);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,flowTexture);
  gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,flow.width,flow.height,gl.RGBA,gl.UNSIGNED_BYTE,flow.pixels);
  gl.uniform1i(uniforms.flowMap,0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,noiseTexture); gl.uniform1i(uniforms.noiseMap,1);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function animate(now: number) {
  frame=0;
  if (!visible || document.hidden || reduced.matches || forced.matches) return;
  const elapsed=Math.max(.001,(now-last)/1000); last=now;
  time+=Math.min(elapsed,.05); updateFlow(Math.min(elapsed,.25));
  for (let i=0;i<16;i+=4) if(clicks[i+3]>0) { clicks[i+2]+=Math.min(elapsed,.05); if(clicks[i+2]>1.6) clicks[i+3]=0; }
  if (now-lastDraw>(flow.energy>.0001 || hasClicks() ? 16 : 40)) { lastDraw=now; draw(); }
  frame=requestAnimationFrame(animate);
 }
 function resume() { cancelAnimationFrame(frame); frame=0; last=performance.now(); if (!visible || document.hidden || reduced.matches || forced.matches) { releasePointer(); flow.clear(); clicks.fill(0); } if (visible && !document.hidden && !reduced.matches && !forced.matches && program) frame=requestAnimationFrame(animate); else draw(); }
 // Keep drawing resolution independent of the ancestor's scroll-exit transform.
 new ResizeObserver(() => { cssWidth=Math.max(1,canvas.clientWidth); cssHeight=Math.max(1,canvas.clientHeight); const scale=Math.min(devicePixelRatio,1.5,2200/cssWidth); canvas.width=Math.round(cssWidth*scale); canvas.height=Math.round(cssHeight*scale); releasePointer(); flow.clear(); draw(); }).observe(hero);
 new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;resume();}).observe(hero);
 document.addEventListener('visibilitychange',resume); reduced.addEventListener('change',resume); forced.addEventListener('change',resume);
 canvas.addEventListener('webglcontextlost', e=>{e.preventDefault();cancelAnimationFrame(frame);program=null;canvas.hidden=true;});
 resume();
}
