import { Box3, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** The user's Joel Dcosta head, with its own anatomy, UVs and PBR textures. */
export async function createSuppliedAlien() {
  const { scene: model } = await new GLTFLoader().loadAsync('/models/supplied-alien-head.glb');
  const root = new Group();
  root.name = 'supplied-alien-head';
  model.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(model);
  const center = bounds.getCenter(new Vector3());
  const height = bounds.getSize(new Vector3()).y;
  model.position.sub(center);
  root.scale.setScalar(1.02 / height);
  root.add(model);
  let incomplete = false;
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!(material instanceof MeshStandardMaterial)) { incomplete = true; continue; }
      // GLTFLoader can resolve after an image failed. Treat missing authored
      // maps as a failed enhancement rather than showing an untextured alien.
      if (!material.map || !material.normalMap || !material.roughnessMap || !material.metalnessMap
        || !(material instanceof MeshPhysicalMaterial) || !material.specularColorMap) incomplete = true;
      material.color.set('#728fff');
      material.metalness = .08;
      material.roughness = .62;
      material.normalScale.set(.65, .65);
      material.envMapIntensity = .75;
    }
  });
  let disposed = false;
  const alien = {
    root,
    pose(x: number, y: number, coarse = false) {
      // This supplied head is a static mesh. Turn its centered volume as a whole.
      root.rotation.set(y * .10, x * (coarse ? .23 : .32), -x * .018);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      const textures = new Set<Texture>();
      model.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
          material.dispose();
        }
      });
      textures.forEach((texture) => {
        texture.dispose();
        if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close();
      });
      root.removeFromParent();
    },
  };
  if (incomplete) { alien.dispose(); throw new Error('Supplied alien texture maps are incomplete'); }
  return alien;
}
