import { expect, test } from '@playwright/test';

test('el cielo ilumina el volumen y los reflejos sin volver a renderizar la geometría quieta', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const threePath = '/node_modules/three/build/three.module.js';
    const passPath = '/src/lib/alien/signal-pass.ts';
    const THREE = await import(threePath);
    const { createSignalPass } = await import(passPath);
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setClearColor(0, 0);
    renderer.setSize(96, 96);
    const context = renderer.getContext();
    const bytes = new Uint8Array(64 * 64 * 4);
    const sky = new THREE.DataTexture(bytes, 64, 64);
    sky.minFilter = THREE.LinearMipmapLinearFilter;
    sky.generateMipmaps = true;
    const scene = new THREE.Scene();
    const geometry = new THREE.SphereGeometry(.8, 32, 24);
    const material = new THREE.MeshBasicMaterial({ color: '#244b9b' });
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10);
    camera.position.z = 2;
    const pass = createSignalPass(renderer, context, sky);
    pass.resize(96, 96, new THREE.Vector4(0, 0, 1, 1));
    pass.arrival(1);
    pass.render(scene, camera);
    const draw = (lit: boolean, right: boolean) => {
      // Keep geometry and the underlying image cached. Only the source sky changes.
      for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
        const index = (y * 64 + x) * 4;
        const light = (right ? x > 32 : x < 32) ? 100 : 0;
        bytes[index] = light * .5; bytes[index + 1] = light * .7;
        bytes[index + 2] = light; bytes[index + 3] = 255;
      }
      sky.needsUpdate = true;
      pass.starlight(lit);
      pass.invalidate();
      pass.present();
      const pixels = new Uint8Array(96 * 96 * 4);
      context.readPixels(0, 0, 96, 96, context.RGBA, context.UNSIGNED_BYTE, pixels);
      let left = 0, rightSide = 0;
      // Sample exclusively inside the sphere, away from its silhouette and sky.
      for (let y = 32; y < 64; y++) for (let x = 24; x < 72; x++) {
        const i = (y * 96 + x) * 4;
        const value = pixels[i] + pixels[i + 1] + pixels[i + 2];
        if (x < 48) left += value; else rightSide += value;
      }
      return { left, right: rightSide };
    };
    const unlit = draw(false, false);
    const fromLeft = draw(true, false);
    const fromRight = draw(true, true);
    const restored = draw(false, true);
    pass.dispose(); sky.dispose(); geometry.dispose(); material.dispose(); renderer.dispose();
    return { unlit, fromLeft, fromRight, restored };
  });
  expect(result.restored).toEqual(result.unlit);
  expect(result.fromLeft.left).toBeGreaterThan(result.unlit.left);
  expect(result.fromLeft.left).toBeGreaterThan(result.fromLeft.right);
  expect(result.fromRight.right).toBeGreaterThan(result.fromRight.left);
});
