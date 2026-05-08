import { TextureLoader, NoColorSpace, Mesh, MeshStandardMaterial } from "three";
import type { Group, Texture } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export const loadMoose = (useAO: boolean): Promise<Group> =>
  new Promise((resolve, reject) => {
    let aoTexture: Texture | null = null;
    if (useAO) {
      aoTexture = new TextureLoader().load("/three/textures/ao.png");
      aoTexture.colorSpace = NoColorSpace;
    }

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      "/three/models/moose-optimized.glb",
      (gltf) => {
        if (useAO && aoTexture) {
          gltf.scene.traverse((obj) => {
            if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
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
        }
        resolve(gltf.scene);
      },
      undefined,
      reject
    );
  });
