import * as THREE from "three";

// Recursively free GPU resources for an object subtree.
export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach(disposeMaterial);
    else if (mat) disposeMaterial(mat);
  });
}

function disposeMaterial(mat: THREE.Material) {
  for (const key of Object.keys(mat)) {
    const v = (mat as unknown as Record<string, unknown>)[key];
    if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
  }
  mat.dispose();
}
