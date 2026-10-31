import {
  Color, DirectionalLight, DoubleSide, HemisphereLight, Mesh,
  MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene,
  type WebGLRenderer,
} from 'three';

/** Local studio reflections, with no HDR download or external texture URLs. */
export function lightAlienStudio(scene: Scene, renderer: WebGLRenderer) {
  const studio = new Scene();
  const cards: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  for (const [x, y, z, width, height, power] of [
    [-3, 4, 5, 2, 4, 4], [4, 2, 3, .6, 3, 2], [2, 3, -4, 2, 3, 3],
  ]) {
    const card = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({
      color: new Color().setRGB(power, power * 1.1, power * 1.4), side: DoubleSide,
    }));
    card.position.set(x, y, z);
    card.lookAt(0, 0, 0);
    studio.add(card);
    cards.push(card);
  }
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .05);
  scene.environment = environment.texture;
  scene.environmentIntensity = .7;
  cards.forEach((card) => { card.geometry.dispose(); card.material.dispose(); });
  pmrem.dispose();
  studio.clear();

  scene.add(new HemisphereLight(0x91bfff, 0x020308, .65));
  const key = new DirectionalLight(0xd6eaff, 3);
  key.position.set(-2, 3, 4);
  const fill = new DirectionalLight(0x174cff, 1.8);
  fill.position.set(3, 0, 2);
  const rim = new DirectionalLight(0x36baff, 5);
  rim.position.set(2, 2, -3);
  scene.add(key, fill, rim);
  return environment;
}
