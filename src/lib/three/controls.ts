import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const createControls = (
  camera: THREE.Camera,
  domElement: HTMLElement
) => {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  return controls;
};
