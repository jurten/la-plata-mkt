const hero = document.querySelector<HTMLElement>('.optical-hero');
if (hero) {
 const canvas = hero.querySelector<HTMLCanvasElement>('[data-atmosphere]')!;

 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let visible = true, frame = 0, time = 0, last = 0;
 const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
 const vertex = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
 const fragment = `precision highp float;
 uniform vec2 res; uniform float clock;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.2,3.1);a*=.5;}return v;}
 vec3 field(vec2 uv){float t=clock*.055;vec2 p=uv*2.6;vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));float n=fbm(p+2.5*q+vec2(t,-t));float ribbon=sin(uv.x*3.5+uv.y*4.8+n*4.5-t);
 vec3 col=mix(vec3(.008,.018,.055),vec3(.025,.13,.70),smoothstep(-.5,.85,ribbon));
 col=mix(col,vec3(.38,.61,.87),pow(smoothstep(.60,1.,ribbon),3.)*.8);
 col+=vec3(.12,.035,.24)*pow(n,3.);
 vec2 starUv=uv*vec2(res.x/res.y,1.)*95.;vec2 cell=floor(starUv),f=fract(starUv)-.5;float s=hash(cell);col+=vec3(.55,.7,1.)*smoothstep(.025,0.,length(f))*step(.987,s)*.38;
 return col;}
 void main(){vec2 uv=gl_FragCoord.xy/res;gl_FragColor=vec4(field(uv),1.);}`;
 let program: WebGLProgram | null = null;
 const uniforms: Record<string, WebGLUniformLocation | null> = {};
 if (gl) {
  const shader = (type: number, source: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; };
  const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (vs && fs) { program = gl.createProgram()!; gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) program = null; }
  if (program) { gl.useProgram(program); const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW); const p = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0); for (const key of ['res','clock']) uniforms[key] = gl.getUniformLocation(program,key); }
 }
 function draw() { if (!gl || !program) return; gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(uniforms.res,canvas.width,canvas.height); gl.uniform1f(uniforms.clock,time); gl.drawArrays(gl.TRIANGLES,0,6); }
 function animate(now: number) { frame=0; if (!visible || document.hidden || reduced.matches) return; if (now-last>40) { time+=Math.min((now-last)/1000,.05); last=now; draw(); } frame=requestAnimationFrame(animate); }
 function resume() { cancelAnimationFrame(frame); frame=0; last=performance.now(); if (visible && !document.hidden && !reduced.matches && program) frame=requestAnimationFrame(animate); else draw(); }
 new ResizeObserver(() => { const r=hero!.getBoundingClientRect(); const scale=Math.min(devicePixelRatio,1.5,2200/r.width); canvas.width=Math.round(r.width*scale); canvas.height=Math.round(r.height*scale); draw(); }).observe(hero);
 new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;resume();}).observe(hero);
 document.addEventListener('visibilitychange',resume); reduced.addEventListener('change',resume);
 canvas.addEventListener('webglcontextlost', e=>{e.preventDefault();cancelAnimationFrame(frame);program=null;});
 resume();
}
