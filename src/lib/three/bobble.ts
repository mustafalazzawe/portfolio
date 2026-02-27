import * as THREE from "three";

const MASS = 1.0; // inertia; higher = heavier, slower acceleration
const STIFFNESS = 40; // torsional spring strength (κ)
const DAMPING = 1.3; // viscous damping (b) — ζ ≈ 0.10, underdamped for ~5-8 bounces
const DRAG_SCALE = 0.003; // radians per pixel
const MAX_ROT = Math.PI / 3; // ±60° displacement clamp
const MAX_VEL = Math.PI * 4; // ±720°/s velocity clamp (prevents 180° ambiguity)
const FIXED_DT = 1 / 60; // fixed physics timestep (seconds)
const REST_EPS = 1e-4; // sleep threshold

const WORLD_Z = new THREE.Vector3(0, -1, 0); // left/right tilt axis (Y compensates for armature -90° X rotation)
const WORLD_X = new THREE.Vector3(1, 0, 0); // up/down nod axis

export const createBobble = (
  bone: THREE.Bone,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera
) => {
  let rotX = 0,
    rotZ = 0; // spring displacement (radians)
  let velX = 0,
    velZ = 0; // spring velocity   (radians/s)

  let accumulator = 0;
  let sleeping = false;

  let isDragging = false;
  let lastX = 0,
    lastY = 0,
    lastTime = 0;

  // Force parent matrix traversal so getWorldQuaternion is accurate.
  bone.updateWorldMatrix(true, false);
  const restQuat = bone.quaternion.clone();
  const parentWorldQuat = new THREE.Quaternion();
  if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQuat);
  const parentWorldQuatInv = parentWorldQuat.clone().invert();

  const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

  // Screen-space hit test — project bone to 2D, check radius. O(1), no mesh traversal.
  const HEAD_HIT_RADIUS = 120; // pixels; covers head + some margin for the neck-origin offset
  const _boneScreenPos = new THREE.Vector3(); // pre-allocated, avoids per-event GC

  const getHit = (clientX: number, clientY: number): boolean => {
    bone.getWorldPosition(_boneScreenPos);
    _boneScreenPos.project(camera);
    const rect = canvas.getBoundingClientRect();
    const sx = (_boneScreenPos.x * 0.5 + 0.5) * rect.width + rect.left;
    const sy = (_boneScreenPos.y * -0.5 + 0.5) * rect.height + rect.top;
    const dx = clientX - sx;
    const dy = clientY - sy;
    return dx * dx + dy * dy < HEAD_HIT_RADIUS * HEAD_HIT_RADIUS;
  };

  // Velocity Verlet integrator — symplectic, no artificial energy drift.
  // Half-step scheme from PDF §4. Uses velHalf as damping approximation
  // for acc1, which is standard practice for velocity-dependent forces.
  const verletStep = (pos: number, vel: number): [number, number] => {
    const acc0 = (-STIFFNESS * pos - DAMPING * vel) / MASS;
    const velHalf = vel + 0.5 * acc0 * FIXED_DT;
    const newPos = clamp(pos + velHalf * FIXED_DT, MAX_ROT);
    const acc1 = (-STIFFNESS * newPos - DAMPING * velHalf) / MASS;
    const newVel = clamp(velHalf + 0.5 * acc1 * FIXED_DT, MAX_VEL);
    return [newPos, newVel];
  };

  // Pre-allocated quaternions for applyBoneRotation — zero per-call heap allocation.
  const _qZ = new THREE.Quaternion();
  const _qX = new THREE.Quaternion();
  const _springQuat = new THREE.Quaternion();
  const _boneQuat = new THREE.Quaternion();

  // Apply spring rotation in world space, then convert to bone-local.
  // boneLocal = P⁻¹ * S * P * restQuat
  // where P = parent world quaternion, S = spring world quaternion.
  const applyBoneRotation = () => {
    _qZ.setFromAxisAngle(WORLD_Z, rotZ); // tilt
    _qX.setFromAxisAngle(WORLD_X, rotX); // nod
    _springQuat.copy(_qZ).multiply(_qX);
    _boneQuat.copy(parentWorldQuatInv).multiply(_springQuat).multiply(parentWorldQuat).multiply(restQuat);
    bone.quaternion.copy(_boneQuat);
  };

  // Prevent browser scroll only when touch starts on the head — lets page scroll otherwise.
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && getHit(e.touches[0].clientX, e.touches[0].clientY)) {
      e.preventDefault();
    }
  }, { passive: false });

  canvas.addEventListener("pointerdown", (e) => {
    if (!getHit(e.clientX, e.clientY)) return;
    isDragging = true;
    sleeping = false;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    velX = velZ = 0;
    canvas.style.cursor = "grabbing";
  });

  // Hover cursor — only fires when pointer is over the canvas and not dragging.
  canvas.addEventListener("pointermove", (e) => {
    if (isDragging) return;
    canvas.style.cursor = getHit(e.clientX, e.clientY) ? "grab" : "";
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;

    const dRotZ = -dx * DRAG_SCALE;
    const dRotX = dy * DRAG_SCALE;
    rotX = clamp(rotX + dRotX, MAX_ROT);
    rotZ = clamp(rotZ + dRotZ, MAX_ROT);

    // Track instantaneous velocity for flick-on-release.
    // Reset to zero if pointer was held still (dt > 100ms).
    if (dt > 0 && dt < 0.1) {
      velX = clamp(dRotX / dt, MAX_VEL);
      velZ = clamp(dRotZ / dt, MAX_VEL);
    } else {
      velX = velZ = 0;
    }
  });

  window.addEventListener("pointerup", () => {
    if (!isDragging) return;
    isDragging = false;
    canvas.style.cursor = "";
    // velX / velZ already seeded; spring takes over next frame
  });

  const update = (delta: number) => {
    if (isDragging) {
      applyBoneRotation();
      return;
    }

    if (sleeping) return;

    // Fixed-timestep accumulator — prevents explosion during frame drops
    accumulator += delta;
    while (accumulator >= FIXED_DT) {
      [rotX, velX] = verletStep(rotX, velX);
      [rotZ, velZ] = verletStep(rotZ, velZ);
      accumulator -= FIXED_DT;
    }

    applyBoneRotation();

    // Rest-state detection — bypass physics once the system has settled
    if (
      Math.abs(rotX) < REST_EPS &&
      Math.abs(rotZ) < REST_EPS &&
      Math.abs(velX) < REST_EPS &&
      Math.abs(velZ) < REST_EPS
    ) {
      rotX = rotZ = velX = velZ = 0;
      sleeping = true;
    }
  };

  // Programmatic spring kick — wakes the physics and tilts the head left,
  // demonstrating the spring without any user interaction.
  const nudge = () => {
    if (isDragging) return;
    sleeping = false;
    velX = 1.8;
    velZ = -0.6;
  };

  return { update, nudge };
};
