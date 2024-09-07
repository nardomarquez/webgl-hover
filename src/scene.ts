import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import postVertexShader from "./post/vertex.glsl";
import postFragmentShader from "./post/fragment.glsl";

export default class Scene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  time: number;
  speed: number;
  targetSpeed: number;
  mouse: THREE.Vector2;
  followMouse: THREE.Vector2;
  prevMouse: THREE.Vector2;
  width: number;
  height: number;
  cameraDistance: number;
  customPass: ShaderPass;
  composer: EffectComposer;
  renderPass: RenderPass;

  constructor() {
    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.cameraDistance = 1000;
    this.camera.position.z = this.cameraDistance;
    this.camera.lookAt(0, 0, 0);

    // mouse params
    this.time = 0;
    this.speed = 0;
    this.targetSpeed = 0;
    this.mouse = new THREE.Vector2();
    this.followMouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();

    this.addEventListeners();
    this.composerPass();
    this.render();
  }

  createMesh(o: { iWidth: number; iHeight: number; width: number; height: number; image: string }) {
    // Mesh
    let geometry = new THREE.PlaneGeometry(1, 1, 80, 80);
    let texture = new THREE.TextureLoader().load(o.image);
    let material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      transparent: true,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(o.width, o.height, o.width / 2);
    this.scene.add(mesh);
  }

  composerPass() {
    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // our custom shader pass for the whole screen, to displace previous render
    this.customPass = new ShaderPass({
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

    // making sure we are rendering it.
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);
  }

  addEventListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    this.onMouseMove();
  }

  onMouseMove() {
    window.addEventListener("mousemove", (e) => {
      const position = [e.clientX, e.clientY];
      this.mouse.x = position[0] / window.innerWidth;
      this.mouse.y = 1 - position[1] / window.innerHeight;
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.camera.fov =
      2 * Math.atan(this.width / this.camera.aspect / (2 * this.cameraDistance)) * (180 / Math.PI); // in degrees
    this.customPass.uniforms.resolution.value.y = this.height / this.width;

    this.camera.updateProjectionMatrix();
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
    requestAnimationFrame(this.render.bind(this));

    this.time += 0.05;
    this.getSpeed();

    console.log(this.targetSpeed);

    this.customPass.uniforms.time.value = this.time;
    this.customPass.uniforms.uMouse.value = this.followMouse;
    this.customPass.uniforms.uVelo.value = this.targetSpeed;
    this.customPass.uniforms.uVelo.value = Math.min(this.targetSpeed, 0.05);
    this.targetSpeed *= 0.999;

    if (this.composer) this.composer.render();
  }
}
