
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export const loadMoose = (): Promise<THREE.Group> =>
  new Promise((resolve, reject) => {
    const aoTexture = new THREE.TextureLoader().load("/three/textures/ao.png");
    aoTexture.colorSpace = THREE.NoColorSpace; 

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      "/three/models/moose.glb",
      (gltf) => {
        gltf.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
            obj.material.aoMap = aoTexture;
            obj.material.aoMapIntensity = 0.3;
            obj.material.needsUpdate = true;

            // AO reads from the second UV channel (uv1 in Three.js r152+).
            // Copy the primary UV since the bake used the same layout.
            if (!obj.geometry.attributes.uv1) {
              obj.geometry.setAttribute("uv1", obj.geometry.attributes.uv);
            }
          }
        });
        resolve(gltf.scene);
      },
      undefined,
      reject
    );
  });
