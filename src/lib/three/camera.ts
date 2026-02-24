import * as THREE from "three";

export const FRUSTUM_SIZE = 3;

export const createCamera = (canvas: HTMLCanvasElement) => {
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new THREE.OrthographicCamera(
    (-FRUSTUM_SIZE * aspect) / 2,
    (FRUSTUM_SIZE * aspect) / 2,
    FRUSTUM_SIZE / 2,
    -FRUSTUM_SIZE / 2,
    0.1,
    100
  );
  camera.position.set(0, 0, 5);
  return camera;
};
