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

  // Rim light — behind and slightly above, pale teal to match brand palette
  const rim = new THREE.DirectionalLight(0x99d0e0, 0.02);
  rim.position.set(0, 1, -4);

  return [ambient, key, fill, rim] as const;
};
