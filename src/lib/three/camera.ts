import * as THREE from "three";

export const createCamera = (canvas: HTMLCanvasElement) => {
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 100);
  camera.position.set(0, 1.2, 6);
  camera.lookAt(0, -0.3, 0);
  return camera;
};
