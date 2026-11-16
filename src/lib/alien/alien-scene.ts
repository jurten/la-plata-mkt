import { ACESFilmicToneMapping, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { createSuppliedAlien } from './supplied-alien';
import { lightAlienStudio } from './studio-lighting';
import { Matrix4, Mesh, Vector3, Vector4 } from 'three';
import { createSignalPass, type AlienSignal } from './signal-pass';
import { getConstellationField } from './constellations';
import { createGalaxySky, galaxyArrivalScale } from './galaxy';

export async function createAlienScene(canvas: HTMLCanvasElement, onProgress?: (progress: number) => void) {
  const context = canvas.getContext('webgl2', {
    alpha: false, antialias: true, depth: true, powerPreference: 'low-power',
  });
  if (!context) throw new Error('3D rendering unavailable');
  const renderer = new WebGLRenderer({ canvas, context, antialias: true });
  renderer.debug.onShaderError = (graphics, _program, vertex, fragment) => {
    throw new Error(`3D shader compilation failed: ${graphics.getShaderInfoLog(fragment) || graphics.getShaderInfoLog(vertex)}`);
  };
  renderer.setClearColor(0x020307, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  const scene = new Scene();
  const field = getConstellationField();
  const forcedColors = matchMedia('(forced-colors: active)');
  const galaxy = createGalaxySky(renderer, context, field.seed);
  const camera = new PerspectiveCamera(32, 1, .01, 30);
  camera.position.set(0, .05, 1.9);
  camera.lookAt(0, 0, 0);
  const environment = lightAlienStudio(scene, renderer);
  const signalPass = createSignalPass(renderer, context, galaxy.texture);
  const heroElement = canvas.closest<HTMLElement>('.alien-hero')!;
  const portraitBounds = new Vector4();
  const layoutBounds = (element: HTMLElement) => {
    let left = 0, top = 0;
    for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
      left += node.offsetLeft; top += node.offsetTop;
    }
    return { left, top, width: element.offsetWidth, height: element.offsetHeight };
  };
  const measureHeadFrame = (width: number, height: number) => {
    // Layout coordinates stay stable through scroll-exit transforms and sticky navigation.
    const portrait = layoutBounds(canvas);
    const nav = document.querySelector<HTMLElement>('.television-nav');
    const footer = heroElement.querySelector<HTMLElement>('.hero-footer');
    const gap = 8;
    const top = Math.max(0, nav ? layoutBounds(nav).top + nav.offsetHeight - portrait.top : 0) + gap;
    const bottom = Math.min(height, footer ? layoutBounds(footer).top - portrait.top : height) - gap;
    // Give height priority. A wider transparent frame keeps the desktop head
    // on the right without letting a narrow copy column shrink it vertically.
    const left = width <= 700 ? gap : width * .25;
    return { left, top, width: width <= 700 ? width - gap * 2 : width, height: Math.max(1, bottom - top) };
  };
  const measurePortraitBounds = () => {
    const box = canvas.getBoundingClientRect();
    const hero = heroElement.getBoundingClientRect();
    // Galaxy input consumes hero-local CSS pixels, independently of a projected
    // scroll-exit frame. A text/font reflow can move the canvas without resizing it.
    const scaleX = hero.width / heroElement.clientWidth || 1;
    const scaleY = hero.height / heroElement.clientHeight || 1;
    return portraitBounds.set((box.left - hero.left) / scaleX, (box.top - hero.top) / scaleY,
      canvas.clientWidth, canvas.clientHeight);
  };

  try {
    const alien = await createSuppliedAlien(onProgress);
    scene.add(alien.root);
    const vertex = new Vector3();
    const points: number[] = [];
    alien.root.updateMatrixWorld(true);
    alien.root.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const position = object.geometry.getAttribute('position');
      for (let index = 0; index < position.count; index++) {
        vertex.fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld);
        points.push(vertex.x, vertex.y, vertex.z);
      }
    });
    const headPoints = new Float32Array(points);
    const projection = new Matrix4();
    const rotation = new Matrix4();
    let disposed = false;
    let dirty = true;
    let lastX = NaN, lastY = NaN, lastCoarse = false;
    return {
      resize(width: number, height: number) {
        const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_600_000 / (width * height)));
        renderer.setPixelRatio(ratio);
        renderer.setSize(width, height, false);
        galaxy.resize(width, height, width <= 700);
        const frame = measureHeadFrame(width, height);
        signalPass.resize(Math.round(frame.width * ratio), Math.round(frame.height * ratio), new Vector4(
          frame.left / width, 1 - (frame.top + frame.height) / height, frame.width / width, frame.height / height,
        ));
        dirty = true;
        camera.aspect = frame.width / frame.height;
        camera.updateProjectionMatrix();
      },
      draw(x: number, y: number, coarse: boolean) {
        if (disposed || context.isContextLost()) throw new Error('3D context unavailable');
        if (dirty || x !== lastX || y !== lastY || coarse !== lastCoarse) {
          alien.pose(x, y, coarse);
          camera.position.set(x * .018, .05 - y * .012, 1.9);
          camera.lookAt(0, 0, 0);
          camera.updateMatrixWorld();
          camera.updateProjectionMatrix();
          projection.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)
            .multiply(rotation.makeRotationFromQuaternion(alien.root.quaternion));
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (let index = 0; index < headPoints.length; index += 3) {
            vertex.fromArray(headPoints, index).applyMatrix4(projection);
            minX = Math.min(minX, vertex.x); maxX = Math.max(maxX, vertex.x);
            minY = Math.min(minY, vertex.y); maxY = Math.max(maxY, vertex.y);
          }
          // Fill 99% of the available height in the actual pose. Uniform zoom
          // preserves proportions; an off-axis projection aligns crown and chin.
          const zoom = 1.98 / Math.max(.001, maxY - minY);
          const matrix = camera.projectionMatrix.elements;
          matrix[0] *= zoom; matrix[5] *= zoom;
          matrix[8] = (minX + maxX) * .5 * zoom;
          matrix[9] = (minY + maxY) * .5 * zoom;
          camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
          signalPass.render(scene, camera);
          lastX = x; lastY = y; lastCoarse = coarse; dirty = false;
        }
        return signalPass.present();
      },
      signal(signal: AlienSignal, drawAllowed = true) {
        if (disposed || context.isContextLost()) throw new Error('3D context unavailable');
        if (!drawAllowed) galaxy.suspend();
        else {
          const box = measurePortraitBounds();
          const pointer = {
            active: signal.pointer.active,
            x: (signal.pointer.x - box.x) / box.z,
            y: 1 - (signal.pointer.y - box.y) / box.w,
          };
          if (galaxy.update(signal.time, signal.enabled && !forcedColors.matches, pointer, signal.warp, forcedColors.matches)) {
            signalPass.invalidate();
          }
          signalPass.arrival(forcedColors.matches ? 1 : galaxyArrivalScale(galaxy.motion));
          signalPass.starlight(!forcedColors.matches);
        }
        return drawAllowed && signalPass.present();
      },
      destroy() {
        if (disposed) return;
        disposed = true;
        alien.dispose();
        signalPass.dispose();
        environment.dispose();
        galaxy.dispose();
        scene.clear();
        renderer.dispose();
      },
    };
  } catch (error) {
    galaxy.dispose();
    signalPass.dispose();
    environment.dispose();
    renderer.dispose();
    throw error;
  }
}
