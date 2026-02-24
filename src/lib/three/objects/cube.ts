import * as THREE from "three";

export const createCube = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x88ccff });

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(5, 5, 5);

  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, material), ambient, sun);
  return group;
};
