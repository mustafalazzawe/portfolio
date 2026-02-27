import { WebGLRenderer } from "three";

export const createRenderer = (
  canvas: HTMLCanvasElement,
  antialias: boolean,
) => {
  const renderer = new WebGLRenderer({
    canvas,
    antialias,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  return renderer;
};
