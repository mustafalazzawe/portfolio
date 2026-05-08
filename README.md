# Portfolio — Mustafa Al-Azzawe

The source for my personal portfolio, built as a small showcase of design-engineering work. A single-page experience covering who I am, what I've built, and how to reach me.

🌐 **Live:** [mustafalazzawe.com](https://mustafalazzawe.com)

## Why this repo is interesting

Beyond being a portfolio, the project leans into a few technical choices worth pointing out:

- **Custom WebGL fragment shader for the background.** Hand-written GLSL — slow-drifting FBM noise with positional Gaussian glows, mouse parallax, and scroll-aware page-space coordinates. About 200 lines of shader code, no third-party library.
- **Interactive 3D bobblehead in the hero.** A stylized moose — modeled and rigged by me in Blender — running a damped harmonic oscillator on its head bone. Click and drag the head; release for a spring-driven settle with overshoot. Velocity Verlet integration, fixed timestep, sleep threshold for idle CPU. Implementation lives in [`src/lib/three/bobble.ts`](src/lib/three/bobble.ts).
- **meshopt-compressed glTF.** The 3D model uses [meshopt](https://github.com/zeux/meshoptimizer) compression — ~50% smaller cold-start payload than the typical Draco setup, with faster decode and a much smaller decoder bundle.
- **Astro Content Collections for projects.** The project list is driven by Zod-validated JSON files, not hardcoded component data. Adding a project is a single-file commit; the build catches schema typos before they ship.
- **Pure `.astro` components.** No React, Vue, or Svelte — Astro generates static HTML and ships only the JavaScript that's actually needed (Three.js bundle is lazy-loaded; everything else is HTML/CSS).
- **Motion design as a first-class concern.** Animations follow the design-engineering principles laid out by [Emil Kowalski](https://animations.dev) — origin-aware popovers, custom ease curves, asymmetric enter/exit timing, full `prefers-reduced-motion` support.
- **Accessibility from day one.** WCAG 1.4.13 hoverable tooltips, keyboard parity for every interaction, reduced-motion paths across GSAP / CSS / WebGL, touch-device hover gating.

## Stack

| Layer | Tech |
|---|---|
| Framework | [Astro 6](https://astro.build) (static output) |
| Language | TypeScript (strict) |
| Animation | [GSAP 3](https://gsap.com) + native CSS transitions |
| 3D | [Three.js 0.183](https://threejs.org) |
| Background | Custom WebGL fragment shader (raw GLSL) |
| Styling | Plain CSS with design tokens |
| Package manager | [bun](https://bun.sh) |

## Local development

```sh
# Install dependencies
bun install

# Start the dev server (localhost:4321)
bun run dev

# Production build to ./dist/
bun run build
```

## License

[CC BY-NC-ND 4.0](LICENSE.md).
