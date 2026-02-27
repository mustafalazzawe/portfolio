import { Clock, Box3, Vector3, Bone } from "three";
import type { Group } from "three";

import { createScene } from "./scene";
import { createCamera } from "./camera";
import { createRenderer } from "./renderer";
import { createControls } from "./controls";
import { createLights } from "./lights";
import { loadMoose } from "./objects/moose";
import { createBobble } from "./bobble";

export function initCanvas(
  canvas: HTMLCanvasElement,
  opts: { antialias: boolean },
) {
  const scene = createScene();
  const camera = createCamera(canvas);
  const renderer = createRenderer(canvas, opts.antialias);
  const controls = createControls(camera, renderer.domElement);
  canvas.style.touchAction = "pan-y"; // override OrbitControls' "none" — let browser scroll

  const lights = createLights();
  scene.add(...lights);

  const onResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };
  window.addEventListener("resize", onResize);
  onResize();

  const clock = new Clock();
  let bobble: ReturnType<typeof createBobble> | null = null;
  let model: Group | null = null;
  let baseModelY = 0;
  let rafId: number | null = null;

  let float: boolean = false;
  let useAO: boolean = false;

  const tick = () => {
    rafId = requestAnimationFrame(tick);
    const delta = clock.getDelta();
    bobble?.update(delta);

    // Idle float — gentle sine wave on model Y, decoupled from bobble physics
    if (float && model) {
      model.position.y =
        baseModelY + Math.sin(clock.getElapsedTime() * 0.8) * 0.04;
    }
    renderer.render(scene, camera);
  };

  // Only render while the canvas is in the viewport — stops GPU work when user scrolls away.
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (rafId === null) tick();
    } else {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }).observe(canvas);

  // Stop auto-nudging once user has dragged the head
  let hasInteracted = false;
  canvas.addEventListener(
    "pointerdown",
    () => {
      hasInteracted = true;
    },
    { once: true },
  );

  loadMoose(useAO).then((m) => {
    const box = new Box3().setFromObject(m);
    const center = box.getCenter(new Vector3());
    m.position.sub(center);

    m.rotation.y = -(Math.PI / 18);

    baseModelY = m.position.y;
    model = m;
    scene.add(m);
    canvas.classList.add("loaded");

    let headBone: Bone | null = null;
    m.traverse((obj) => {
      if (obj instanceof Bone && obj.name === "Head") headBone = obj;
    });
    if (headBone) bobble = createBobble(headBone, canvas, camera);

    // Auto-nudge — demonstrates spring physics if user hasn't interacted yet
    const scheduleNudge = (delay: number) => {
      setTimeout(() => {
        if (!hasInteracted) {
          bobble?.nudge();
          scheduleNudge(30000);
        }
      }, delay);
    };
    scheduleNudge(2500);
  });
}
