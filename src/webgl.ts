import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import postVertexShader from "./post/vertex.glsl";
import postFragmentShader from "./post/fragment.glsl";

// Preload images
const images = document.querySelectorAll("img");
const image = images[0];

const bounds = image.getBoundingClientRect();
// const fromTop = bounds.top;
// const windowHeight = window.innerHeight;
// const withoutHeight = fromTop - windowHeight;
// const withHeight = fromTop + bounds.height;
// const insideTop = withoutHeight - docScroll;
// const insideRealTop = fromTop + docScroll;
// const insideBottom = withHeight - docScroll + 50;
const width = bounds.width;
const height = bounds.height;
// const left = bounds.left;
let o = {
  iWidth: image.width,
  iHeight: image.height,
  width: width,
  height: height,
};

// Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 1000;
controls.update();

// Mesh
let geometry = new THREE.PlaneGeometry(1, 1, 80, 80);
let texture = new THREE.TextureLoader().load(image.src);
let material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    time: { value: 0 },
    progress: { value: 0 },
    angle: { value: 0 },
    texture1: { value: texture },
    texture2: { value: null },
    resolution: { value: new THREE.Vector4() },
    uvRate1: {
      value: new THREE.Vector2(1, 1),
    },
  },
  // wireframe: true,
  transparent: true,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

let imageAspect = o.iHeight / o.iWidth;
let a1;
let a2;
if (o.height / o.width > imageAspect) {
  a1 = (o.width / o.height) * imageAspect;
  a2 = 1;
} else {
  a1 = 1;
  a2 = o.height / o.width / imageAspect;
}
material.uniforms.resolution.value.x = o.width;
material.uniforms.resolution.value.y = o.height;
material.uniforms.resolution.value.z = a1;
material.uniforms.resolution.value.w = a2;
material.uniforms.progress.value = 0;
material.uniforms.angle.value = 0.3;

let mesh = new THREE.Mesh(geometry, material);
mesh.scale.set(o.width, o.height, o.width / 2);
scene.add(mesh);

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// // our custom shader pass for the whole screen, to displace previous render
let customPass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    distort: { value: 0 },
    resolution: { value: new THREE.Vector2(1, window.innerHeight / window.innerWidth) },
    uMouse: { value: new THREE.Vector2(-10, -10) },
    uVelo: { value: 0 },
    uScale: { value: 0 },
    uType: { value: 0 },
    time: { value: 0 },
  },
  vertexShader: postVertexShader,
  fragmentShader: postFragmentShader,
});
// // making sure we are rendering it.
customPass.renderToScreen = true;
composer.addPass(customPass);

// Render loop
function tick() {
  requestAnimationFrame(tick);

  if (composer) {
    composer.render();
  }
}

export default tick;
