import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import postVertexShader from "./shaders/post/vertex.glsl";
import postFragmentShader from "./shaders/post/fragment.glsl";

interface Props {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sizes: { width: number; height: number };
}

export default class PostProcessing {
  composer: EffectComposer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sizes: { width: number; height: number };
  renderPass: RenderPass;
  customPass: ShaderPass;
  time: number;
  speed: number;
  targetSpeed: number;
  mouse: THREE.Vector2;
  followMouse: THREE.Vector2;
  prevMouse: THREE.Vector2;

  constructor({ renderer, scene, camera, sizes }: Props) {
    // Initialize
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // pass
    this.customPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        distort: { value: 0 },
        resolution: { value: new THREE.Vector2(1, sizes.height / sizes.width) },
        uMouse: { value: new THREE.Vector2(-10, -10) },
        uVelo: { value: 0 },
        uScale: { value: 0 },
        uType: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
    });
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);

    // mouse params
    this.time = 0;
    this.speed = 0;
    this.targetSpeed = 0;
    this.mouse = new THREE.Vector2();
    this.followMouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();

    // Events
    this.onMouseMove();
  }

  onMouseMove() {
    window.addEventListener("mousemove", (e) => {
      const position = [e.clientX, e.clientY];
      this.mouse.x = position[0] / window.innerWidth;
      this.mouse.y = 1 - position[1] / window.innerHeight;
    });
  }

  getSpeed() {
    this.speed = Math.sqrt(
      (this.prevMouse.x - this.mouse.x) ** 2 + (this.prevMouse.y - this.mouse.y) ** 2
    );

    this.targetSpeed -= 0.01 * (this.targetSpeed - this.speed);
    this.followMouse.x -= 0.1 * (this.followMouse.x - this.mouse.x);
    this.followMouse.y -= 0.1 * (this.followMouse.y - this.mouse.y);

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  render() {
    this.time += 0.05;
    this.getSpeed();
    this.customPass.uniforms.time.value = this.time;
    this.customPass.uniforms.uMouse.value = this.followMouse;
    // this.customPass.uniforms.uVelo.value = this.settings.velo;
    this.customPass.uniforms.uVelo.value = Math.min(this.targetSpeed, 0.05);
    this.targetSpeed *= 0.999;

    this.composer.render();
  }
}
