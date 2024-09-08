import * as THREE from "three";
import Lenis from "lenis";
import PostProcessing from "./post";
import Images from "./images";

let cameraDistance = 10;

export default class Scene {
  container: HTMLElement;
  images: Images;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  postProcessing: PostProcessing;
  width: number;
  height: number;
  lenis: Lenis;

  constructor() {
    // init
    window.scrollTo(0, 0);
    this.lenis = new Lenis();
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.container = document.querySelector(".webgl") as HTMLElement;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 100);
    this.camera.fov = 2 * Math.atan(this.height / 2 / cameraDistance) * (180 / Math.PI);
    this.camera.position.set(0, 0, cameraDistance);

    // create images
    let images = [...document.querySelectorAll("img")];
    this.images = new Images({
      scene: this.scene,
      images: images,
      lenis: this.lenis,
    });

    // Post Processing
    this.postProcessing = new PostProcessing({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      sizes: { width: this.width, height: this.height },
    });

    // methods
    this.resize();
    this.render();

    // events
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.fov = 2 * Math.atan(this.height / 2 / cameraDistance) * (180 / Math.PI);
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }

  render() {
    requestAnimationFrame((e) => {
      this.images.render(e);

      if (this.postProcessing) {
        this.postProcessing.render();
      }

      this.render();
    });
  }
}
