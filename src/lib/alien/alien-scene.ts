import { ACESFilmicToneMapping, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { createSuppliedAlien } from './supplied-alien';
import { lightAlienStudio } from './studio-lighting';

export async function createAlienScene(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('webgl2', {
    alpha: false, antialias: true, depth: true, powerPreference: 'low-power',
  });
  if (!context) throw new Error('3D rendering unavailable');
  const renderer = new WebGLRenderer({ canvas, context, antialias: true });
  renderer.setClearColor(0x020307);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, .01, 30);
  camera.position.set(0, .05, 1.9);
  camera.lookAt(0, 0, 0);
  const environment = lightAlienStudio(scene, renderer);

  try {
    const alien = await createSuppliedAlien();
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
          renderer.render(scene, camera);
          lastX = x; lastY = y; lastCoarse = coarse; dirty = false;
        }
      },
      destroy() {
        if (disposed) return;
        disposed = true;
        alien.dispose();
        environment.dispose();
        scene.clear();
        renderer.dispose();
      },
    };
  } catch (error) {
    environment.dispose();
    renderer.dispose();
    throw error;
  }
}
