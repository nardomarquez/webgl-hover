import Lenis from "lenis";
import * as THREE from "three";

let cameraDistance = 10;

interface ImageProps {
  scene: THREE.Scene;
  images: HTMLImageElement[];
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export default class Images {
  scene: THREE.Scene;
  images: HTMLImageElement[];
  imageData: {
    image: HTMLImageElement;
    mesh: THREE.Mesh;
    top: number;
    left: number;
    width: number;
    height: number;
  }[] = [];
  scroll: number;
  width: number;
  height: number;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  lenis: Lenis;

  constructor({ scene, images, camera, renderer }: ImageProps) {
    window.scrollTo(0, 0);
    this.lenis = new Lenis();
    this.scroll = this.lenis.scroll;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = scene;
    this.images = images;
    this.camera = camera;
    this.renderer = renderer;

    this.createImages();
    this.onResize();

    // events
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("scroll", () => {
      this.scroll = this.lenis.scroll;
    });
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

  updatePosition() {
    this.imageData.forEach((image) => {
      image.mesh.position.x = image.left - this.width / 2 + image.width / 2;
      image.mesh.position.y = this.scroll - image.top + this.height / 2 - image.height / 2;
    });
  }

  updateImageData() {
    this.imageData.forEach((image, i) => {
      image.top = this.images[i].getBoundingClientRect().top + this.scroll;
      image.height = this.images[i].getBoundingClientRect().height;
      image.left = this.images[i].getBoundingClientRect().left;
      image.width = this.images[i].getBoundingClientRect().width;
      image.mesh.scale.set(image.width, image.height, 1);
    });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.fov = 2 * Math.atan(this.height / 2 / cameraDistance) * (180 / Math.PI);
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }

  render(e: number) {
    this.updatePosition();
    this.updateImageData();
    this.lenis.raf(e);
  }
}
