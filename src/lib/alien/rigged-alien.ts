import {
  Bone, Euler, Group, Mesh, MeshStandardMaterial, Quaternion, SkinnedMesh,
  Texture, Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createDetailSkin } from './detail-skin';
import { refineHeadGeometry } from './refine-head-geometry';

/** Licensed closed model with its original rig and refined physical surface. */
export async function createRiggedAlien(image: HTMLImageElement) {
  const gltf = await new GLTFLoader().loadAsync('/models/alien-grey-head-web.glb');
  const model = gltf.scene;
  const root = new Group();
  root.name = 'refined-rigged-alien';
  root.add(model);
  const skin = createDetailSkin(image);
  let disposed = false;

  function dispose() {
    if (disposed) return;
    disposed = true;
    const geometries = new Set<Mesh['geometry']>();
    const materials = new Set<MeshStandardMaterial>();
    const textures = new Set<Texture>();
    const skeletons = new Set<SkinnedMesh['skeleton']>();
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!(material instanceof MeshStandardMaterial)) continue;
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
      }
      if (object instanceof SkinnedMesh) skeletons.add(object.skeleton);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => {
      texture.dispose();
      if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close();
    });
    skeletons.forEach((skeleton) => skeleton.dispose());
    skin.dispose();
    root.removeFromParent();
  }

  try {
    model.updateMatrixWorld(true);
    const head = model.getObjectByName('Head');
    const neck = model.getObjectByName('neck');
    if (!(head instanceof Bone) || !(neck instanceof Bone)) throw new Error('Alien head rig is missing');
    const center = head.getWorldPosition(new Vector3());
    center.y += .084;
    const scale = 4.5 / 1.4;
    root.scale.setScalar(scale);
    root.position.copy(center).multiplyScalar(-scale);
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      refineHeadGeometry(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!(material instanceof MeshStandardMaterial)) throw new Error('Alien skin material is missing');
        if (!material.map || !material.normalMap || !material.roughnessMap || !material.metalnessMap) {
          throw new Error('Alien skin maps are incomplete');
        }
        material.color.set('#668dff');
        material.metalness = .03;
        material.roughness = .55;
        material.normalScale.set(.45, .45);
        material.envMapIntensity = 1.25;
        skin.apply(object.geometry, material);
      }
    });
    const headRest = head.quaternion.clone();
    const neckRest = neck.quaternion.clone();
    const delta = new Quaternion();
    const angles = new Euler();
    return {
      root, model, head, neck,
      pose(x: number, y: number, coarse = false) {
        delta.setFromEuler(angles.set(y * .11, x * (coarse ? .28 : .38), -x * .025));
        head.quaternion.copy(headRest).multiply(delta);
        delta.setFromEuler(angles.set(y * .02, x * .045, 0));
        neck.quaternion.copy(neckRest).multiply(delta);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
