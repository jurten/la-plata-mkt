import { Renderer, Program, Mesh, Triangle, RenderTarget } from 'ogl';
import { vertex, fragment as heroWarpFragment } from './warp-text-shaders';

// Three light narratives. The second pass retains the hero's optical material.
const sculptureFragment = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uKind;
uniform float uSceneTime;
vec2 turn(vec2 p, float a) { return mat2(cos(a),-sin(a),sin(a),cos(a))*p; }
const vec3 blue=vec3(.10,.28,1.0);
const vec3 sky=vec3(.38,.73,1.0);
const vec3 ice=vec3(.82,.95,1.0);
const float PI=3.14159265359;
vec3 lineLight(float distance,vec3 color) {
  float d=abs(distance);
  return color*(exp(-d*36.0)*.40+exp(-d*110.0)*.75)+ice*exp(-d*520.0)*.9;
}
vec3 orb(vec2 p,float radius,vec3 color) {
  float distance=dot(p,p)/(radius*radius);
  return color*exp(-distance*1.25)*.8+color*exp(-distance*5.0)*.9+ice*exp(-distance*20.0);
}
float resultRadius(float angle) { return .25+.045*cos(angle*4.0); }
float aperture(vec2 p) {
  vec2 q=turn(p,.22);
  return (length(q/vec2(.30,.215))-1.0)*.215;
}
vec3 combine(vec2 p,float phase) {
  float approach=smoothstep(.20,.48,phase);
  float born=smoothstep(.47,.62,phase);
  float separation=mix(.27,.018,approach);
  float floatY=.025*sin(uSceneTime*.9)*(1.0-approach);
  vec3 sources=orb(p-vec2(-separation,floatY),.105,blue);
  sources+=orb(p-vec2(separation,-floatY),.105,sky);
  float angle=atan(p.y,p.x);
  float outline=length(p)-resultRadius(angle);
  vec3 result=lineLight(outline,mix(blue,sky,.5+.5*sin(angle)));
  result+=orb(p,.13,blue)*.25;
  float contact=exp(-pow((phase-.49)/.04,2.0));
  vec3 flare=orb(p,.18,sky)*contact*.85;
  return sources*(1.0-born)+result*born+flare;
}
vec3 discover(vec2 p,float phase) {
  float reveal=smoothstep(.18,.65,phase);
  float wipe=mix(-.48,.48,reveal);
  float clarity=1.0-smoothstep(wipe-.065,wipe+.065,p.x);
  float d=aperture(p);
  vec3 blurred=sky*exp(-pow(d/.075,2.0))*.7;
  blurred+=blue*exp(-dot(p,p)/.12)*.24;
  vec3 sharp=lineLight(d,mix(blue,sky,.5+.5*p.y));
  sharp+=orb(p,.045,sky)*.85;
  float scan=exp(-pow((p.x-wipe)/.025,2.0))*exp(-dot(p,p)/.11);
  scan*=smoothstep(.02,.15,reveal)*(1.0-smoothstep(.84,.99,reveal));
  return mix(blurred,sharp,clarity)+ice*scan*.32;
}
vec3 articulate(vec2 p,float phase) {
  float joined=smoothstep(.18,.64,phase);
  float separation=mix(.09,0.0,joined);
  vec3 light=vec3(0.0);
  for(int i=0;i<3;i++) {
    float orientation=PI*.5+float(i)*PI*2.0/3.0;
    vec2 direction=vec2(cos(orientation),sin(orientation));
    vec2 q=p-direction*separation;
    q=turn(q,(1.0-joined)*(float(i)-1.0)*.34);
    float angle=atan(q.y,q.x);
    float delta=atan(sin(angle-orientation),cos(angle-orientation));
    float mask=1.0-smoothstep(PI/3.0-.065,PI/3.0+.065,abs(delta));
    float radius=.26+.04*cos((angle-PI*.5)*3.0);
    vec3 color=i==0?sky:(i==1?blue:mix(blue,sky,.5));
    light+=lineLight(length(q)-radius,color)*mask;
  }
  float resolved=smoothstep(.60,.75,phase);
  light+=orb(p,.095,sky)*resolved*.4;
  return light;
}
void main() {
  vec2 p=(vUv-.5)*vec2(uResolution.x/uResolution.y,1.0)*.86;
  float phase=mod(uSceneTime,11.0)/11.0;
  float envelope=smoothstep(0.0,.045,phase)*(1.0-smoothstep(.89,.995,phase));
  vec3 light=uKind<.5?combine(p,phase):(uKind<1.5?discover(p,phase):articulate(p,phase));
  vec3 background=vec3(.03137,.05490,.14118);
  // Soft exposure preserves luminous blue edges without blowing out the field.
  vec3 color=background+(1.0-exp(-light*1.35))*envelope;
  fragColor=vec4(color,1.0);
}`;

function createValueBlob(host: HTMLElement, kind: number) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let renderer: Renderer | undefined, target: RenderTarget | undefined;
  let geometry: Triangle | undefined, sculpture: Program | undefined, warp: Program | undefined;
  let sculptureMesh: Mesh | undefined, warpMesh: Mesh | undefined, canvas: HTMLCanvasElement | undefined;
  let visible = false, failed = false, disposed = false, frame = 0, last = 0, lastDraw = 0;
  let time = kind * 2.7, sceneTime = .88, intro = 0, interactionUntil = 0, slot = 0;
  let hovered = false, touchPlaying = false, holding = false;
  const resolution = new Float32Array([1, 1]);
  const clicks = Array.from({ length: 4 }, () => [0.5, 0.5, 0, 0]);
  const pointer = { x: .5, y: .5, tx: .5, ty: .5, active: 0, target: 0 };
  const allowed = () => visible && !document.hidden && !reduced.matches && !forced.matches && !failed && !disposed;
  const fallback = () => {
    cancelAnimationFrame(frame); frame = 0;
    host.removeAttribute('data-value-warp-ready');
    if (canvas) canvas.hidden = true;
  };
  const onContextLost = () => { failed = true; fallback(); };
  function updateStage() {
    const phase = sceneTime / 11;
    const stages = kind === 0 ? ['separate', 'merging', 'created'] : kind === 1 ? ['blurred', 'revealing', 'clear'] : ['parts', 'connecting', 'whole'];
    if (canvas) canvas.dataset.sceneStage = phase < .2 ? stages[0] : phase < .66 ? stages[1] : stages[2];
  }
  function resetPlayback() {
    cancelAnimationFrame(frame); frame = 0;
    hovered = false; touchPlaying = false; holding = false;
    sceneTime = .88; intro = 0; interactionUntil = 0;
    pointer.active = 0; pointer.target = 0;
    clicks.forEach(click => { click[3] = 0; });
    if (sculpture) sculpture.uniforms.uSceneTime.value = sceneTime;
    if (warp) {
      warp.uniforms.uMotion.value = 0;
      warp.uniforms.uPointerActive.value = 0;
      warp.uniforms.uIntro.value = 0;
    }
    if (canvas) canvas.dataset.animationState = 'idle';
    updateStage();
  }
  function render() {
    if (!renderer || !warpMesh || !sculptureMesh || !target || !canvas || !allowed()) return;
    renderer.render({ scene: sculptureMesh, target });
    renderer.render({ scene: warpMesh });
    canvas.hidden = false;
    host.setAttribute('data-value-warp-ready', '');
  }
  function resize() {
    if (!renderer || !target || !sculptureMesh || !warp) return;
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    resolution.set([width, height]);
    target.setSize(renderer.gl.canvas.width, renderer.gl.canvas.height);
    render();
  }
  function createRenderer() {
    if (renderer) return true;
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, depth: false, stencil: false, premultipliedAlpha: true, dpr: Math.min(devicePixelRatio || 1, 1.5), powerPreference: 'low-power' });
      if (!renderer.isWebgl2) throw Error('Static fallback');
      const gl = renderer.gl;
      canvas = gl.canvas;
      canvas.className = 'about-value__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.addEventListener('webglcontextlost', onContextLost);
      host.append(canvas);
      gl.clearColor(0, 0, 0, 0);
      target = new RenderTarget(gl, { width: 1, height: 1, depth: false, premultiplyAlpha: true });
      geometry = new Triangle(gl);
      sculpture = new Program(gl, { vertex, fragment: sculptureFragment, depthTest: false, depthWrite: false, uniforms: { uResolution: { value: resolution }, uKind: { value: kind }, uSceneTime: { value: sceneTime } } });
      warp = new Program(gl, { vertex, fragment: heroWarpFragment, transparent: true, depthTest: false, depthWrite: false, uniforms: {
        uTextTexture: { value: target.texture }, uResolution: { value: resolution }, uPointer: { value: new Float32Array([.5, .5]) }, uPointerActive: { value: 0 },
        uTime: { value: time }, uWarpStrength: { value: .45 }, uWarpScale: { value: 1 }, uSpeed: { value: .55 },
        uPointerInfluence: { value: .43 }, uPointerStrength: { value: .42 }, uRefraction: { value: .012 }, uChromatic: { value: .25 },
        uRipple: { value: .6 }, uMotion: { value: 0 }, uLens: { value: 0 }, uIntro: { value: 0 }, uReveal: { value: 1 }, uBackdrop: { value: 0 }, uClicks: { value: clicks },
      } });
      if (![sculpture, warp].every(program => gl.getProgramParameter(program.program, gl.LINK_STATUS))) throw Error('Static fallback');
      sculptureMesh = new Mesh(gl, { geometry, program: sculpture });
      warpMesh = new Mesh(gl, { geometry, program: warp });
      resize();
      if (canvas) canvas.dataset.animationState = 'idle';
      updateStage();
      return true;
    } catch { failed = true; fallback(); return false; }
  }
  function tick(now: number) {
    frame = 0;
    if (!allowed() || !warp) return;
    if (now - lastDraw < 1000 / 30) { frame = requestAnimationFrame(tick); return; }
    const dt = Math.min((now - last) / 1000, .065);
    last = now; lastDraw = now; time += dt; sceneTime = Math.min(8.8, sceneTime + dt * 2.4); intro = Math.max(0, intro - dt);
    if (sculpture) sculpture.uniforms.uSceneTime.value = sceneTime;
    const follow = 1 - Math.exp(-dt / .13);
    pointer.x += (pointer.tx - pointer.x) * follow;
    pointer.y += (pointer.ty - pointer.y) * follow;
    pointer.active += (pointer.target - pointer.active) * follow;
    warp.uniforms.uPointer.value.set([pointer.x, pointer.y]);
    warp.uniforms.uPointerActive.value = pointer.active;
    warp.uniforms.uTime.value = time;
    warp.uniforms.uIntro.value = intro / 4.2 * .12;
    clicks.forEach(click => { if (click[3]) { click[2] += dt; if (click[2] > 1.6) click[3] = 0; } });
    render();
    const settling = Math.abs(pointer.active - pointer.target) > .002 || Math.hypot(pointer.x - pointer.tx, pointer.y - pointer.ty) > .001;
    const playing = sceneTime < 8.8 || now < interactionUntil || settling || clicks.some(click => click[3] > 0);
    holding = !playing;
    if (canvas) canvas.dataset.animationState = playing ? 'playing' : 'holding';
    updateStage();
    if (playing) frame = requestAnimationFrame(tick);
    else touchPlaying = false;
  }
  function wake() {
    if (!allowed()) { resetPlayback(); fallback(); return; }
    if (!createRenderer()) return;
    if (!hovered && !touchPlaying) { render(); return; }
    if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
  }
  const locatePointer = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.tx = (event.clientX - rect.left) / rect.width;
    pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !allowed()) return;
    if (!hovered) onEnter(event);
    locatePointer(event); pointer.target = 1;
    interactionUntil = performance.now() + 700; wake();
  };
  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !allowed()) return;
    resetPlayback(); hovered = true; intro = 4.2;
    locatePointer(event); pointer.target = 1;
    if (warp) warp.uniforms.uMotion.value = 1;
    wake();
    if (warp) warp.uniforms.uMotion.value = 1;
  };
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.type !== 'pointercancel') return;
    resetPlayback(); if (allowed()) render();
  };
  const onClick = (event: PointerEvent) => {
    if (event.button !== 0 || !allowed()) return;
    if (event.pointerType === 'touch' || holding) {
      resetPlayback();
      touchPlaying = event.pointerType === 'touch'; hovered = !touchPlaying; intro = 4.2;
    }
    locatePointer(event);
    const click = clicks[slot++ % 4];
    click[0] = pointer.tx; click[1] = pointer.ty; click[2] = 0; click[3] = 1;
    interactionUntil = performance.now() + 1700; wake();
    if (warp) warp.uniforms.uMotion.value = 1;
  };
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
  intersection.observe(host);
  const layout = new ResizeObserver(() => { resize(); wake(); });
  layout.observe(host);
  host.addEventListener('pointerenter', onEnter);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('pointercancel', onLeave);
  host.addEventListener('pointerdown', onClick);
  document.addEventListener('visibilitychange', wake);
  reduced.addEventListener('change', wake); forced.addEventListener('change', wake);
  return () => {
    disposed = true; fallback(); intersection.disconnect(); layout.disconnect();
    host.removeEventListener('pointerenter', onEnter);
    host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
    host.removeEventListener('pointercancel', onLeave); host.removeEventListener('pointerdown', onClick);
    document.removeEventListener('visibilitychange', wake);
    reduced.removeEventListener('change', wake); forced.removeEventListener('change', wake);
    canvas?.removeEventListener('webglcontextlost', onContextLost);
    geometry?.remove(); sculpture?.remove(); warp?.remove();
    if (renderer && target) { renderer.gl.deleteFramebuffer(target.buffer); target.textures.forEach(texture => renderer!.gl.deleteTexture(texture.texture)); }
    renderer?.gl.getExtension('WEBGL_lose_context')?.loseContext(); canvas?.remove();
  };
}

export function initValueBlobs(root: HTMLElement) {
  const cleanup = [...root.querySelectorAll<HTMLElement>('[data-value-visual]')].map(createValueBlob);
  return () => cleanup.forEach(destroy => destroy());
}
