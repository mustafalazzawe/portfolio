import * as THREE from "three";

export const createLights = () => {
  // Base fill — keeps shadows from going fully black
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);

  // Key light — front-upper-left, matches Blender's default
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-2, 3, 4);

  // Fill light — right side, low intensity
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(3, 1, 3);

  return [ambient, key, fill] as const;
};
