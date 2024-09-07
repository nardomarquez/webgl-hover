import * as THREE from "three";
import PostProcessing from "./post";

let cameraDistance = 10;

export default class Scene {
  canvas: HTMLCanvasElement;
  images: HTMLImageElement[] = [];
  imageData: {
    image: HTMLImageElement;
    mesh: THREE.Mesh;
    top: number;
    left: number;
    width: number;
    height: number;
  }[] = [];
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  postProcessing: PostProcessing;

  scroll: number;
  width: number;
  height: number;

  constructor() {
    // init
    this.scroll = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.canvas,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 100);
    this.camera.fov = 2 * Math.atan(this.height / 2 / cameraDistance) * (180 / Math.PI);
    this.camera.position.set(0, 0, cameraDistance);

    // create images
    this.images = [...document.querySelectorAll("img")];
    this.createImages();

    // Post Processing
    this.postProcessing = new PostProcessing({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      sizes: { width: this.width, height: this.height },
    });

    // methods
    this.onResize();
    this.render();

    window.addEventListener("resize", this.onResize.bind(this));
  }

  createImages() {
    let geometry = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.imageData = this.images.map((image) => {
      let boundaries = image.getBoundingClientRect();

      let texture = new THREE.TextureLoader().load(image.src);
      let material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: texture,
        transparent: true,
      });
      const imageMesh = new THREE.Mesh(geometry, material);

      imageMesh.scale.set(boundaries.width, boundaries.height, 1);

      this.scene.add(imageMesh);

      return {
        image: image,
        mesh: imageMesh,
        top: boundaries.top,
        left: boundaries.left,
        width: boundaries.width,
        height: boundaries.height,
      };
    });
  }

  // update position of images in the scene
  updatePosition() {
    this.imageData.forEach((image) => {
      image.mesh.position.x = image.left - this.width / 2 + image.width / 2;
      image.mesh.position.y = this.scroll - image.top + this.height / 2 - image.height / 2;
    });
  }

  onResize() {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    if (this.imageData) {
      for (let i = 0; i < this.imageData.length; i++) {
        this.imageData[i].top = this.images[i].getBoundingClientRect().top;
        this.imageData[i].height = this.images[i].getBoundingClientRect().height;
        this.imageData[i].left = this.images[i].getBoundingClientRect().left;
        this.imageData[i].width = this.images[i].getBoundingClientRect().width;
        this.imageData[i].mesh.scale.set(
          this.images[i].getBoundingClientRect().width,
          this.images[i].getBoundingClientRect().height,
          1
        );
      }
    }
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    this.updatePosition();
    // this.renderer.render(this.scene, this.camera);
    if (this.postProcessing) {
      console.log("rendering");
      this.postProcessing.render();
    }
  }
}
