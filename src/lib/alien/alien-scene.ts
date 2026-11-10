import { ACESFilmicToneMapping, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { createSuppliedAlien } from './supplied-alien';
import { lightAlienStudio } from './studio-lighting';
import { Vector4 } from 'three';
import { createSignalPass, type AlienSignal } from './signal-pass';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { getConstellationField, paintConstellations } from './constellations';

export async function createAlienScene(canvas: HTMLCanvasElement, onProgress?: (progress: number) => void) {
  const context = canvas.getContext('webgl2', {
    alpha: false, antialias: true, depth: true, powerPreference: 'low-power',
  });
  if (!context) throw new Error('3D rendering unavailable');
  const renderer = new WebGLRenderer({ canvas, context, antialias: true });
  renderer.debug.onShaderError = (graphics, _program, vertex, fragment) => {
    throw new Error(`3D shader compilation failed: ${graphics.getShaderInfoLog(fragment) || graphics.getShaderInfoLog(vertex)}`);
  };
  renderer.setClearColor(0x020307);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  const scene = new Scene();
  const skyCanvas = document.createElement('canvas');
  const skyContext = skyCanvas.getContext('2d');
  const field = getConstellationField();
  const forcedColors = matchMedia('(forced-colors: active)');
  const skyTexture = skyContext ? new CanvasTexture(skyCanvas) : undefined;
  if (skyTexture) {
    skyTexture.colorSpace = SRGBColorSpace;
    scene.background = skyTexture;
    // Compensate for the existing scene/postprocess tone mapping on faint stars.
    scene.backgroundIntensity = 2.2;
  }
  let skyWidth = 1, skyHeight = 1;
  const paintSky = (x: number, y: number, coarse: boolean) => {
    if (!skyContext || !skyTexture) return;
    const ratio = skyCanvas.width / skyWidth;
    skyContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (forcedColors.matches) {
      skyContext.fillStyle = '#020307';
      skyContext.fillRect(0, 0, skyWidth, skyHeight);
    } else {
      paintConstellations(skyContext, skyWidth, skyHeight, field, coarse ? 0 : x, coarse ? 0 : y);
    }
    skyTexture.needsUpdate = true;
  };
  const camera = new PerspectiveCamera(32, 1, .01, 30);
  camera.position.set(0, .05, 1.9);
  camera.lookAt(0, 0, 0);
  const environment = lightAlienStudio(scene, renderer);
  const signalPass = createSignalPass(renderer, context);

  try {
    const alien = await createSuppliedAlien(onProgress);
    scene.add(alien.root);
    const origin = alien.root.position.clone();
    let disposed = false;
    let dirty = true;
    let lastX = NaN, lastY = NaN, lastCoarse = false;
    return {
      resize(width: number, height: number) {
        const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_600_000 / (width * height)));
        renderer.setPixelRatio(ratio);
        renderer.setSize(width, height, false);
        skyWidth = width; skyHeight = height;
        skyCanvas.width = Math.round(width * ratio);
        skyCanvas.height = Math.round(height * ratio);
        const box = canvas.getBoundingClientRect();
        const hero = canvas.closest('.alien-hero')!.getBoundingClientRect();
        signalPass.resize(canvas.width, canvas.height, new Vector4(box.left - hero.left, box.top - hero.top, width, height));
        dirty = true;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const worldHeight = 2 * 1.9 * Math.tan(32 * Math.PI / 360);
        alien.root.position.x = origin.x + (width <= 700 ? 0 : worldHeight * camera.aspect * .23);
      },
      draw(x: number, y: number, coarse: boolean) {
        if (disposed || context.isContextLost()) throw new Error('3D context unavailable');
        if (dirty || x !== lastX || y !== lastY || coarse !== lastCoarse) {
          alien.pose(x, y, coarse);
          camera.position.set(x * .018, .05 - y * .012, 1.9);
          camera.lookAt(0, 0, 0);
          paintSky(x, y, coarse);
          signalPass.render(scene, camera);
          lastX = x; lastY = y; lastCoarse = coarse; dirty = false;
        }
        return signalPass.present();
      },
      signal(signal: AlienSignal, drawAllowed = true) {
        if (disposed || context.isContextLost()) throw new Error('3D context unavailable');
        return signalPass.signal(signal, drawAllowed);
      },
      destroy() {
        if (disposed) return;
        disposed = true;
        alien.dispose();
        signalPass.dispose();
        environment.dispose();
        skyTexture?.dispose();
        scene.clear();
        renderer.dispose();
      },
    };
  } catch (error) {
    skyTexture?.dispose();
    signalPass.dispose();
    environment.dispose();
    renderer.dispose();
    throw error;
  }
}
