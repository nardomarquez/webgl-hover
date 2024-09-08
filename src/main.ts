import "./style.css";
import Scene from "./webgl/scene";

window.addEventListener("load", () => {
  const scene = new Scene();

  scene.render();
});
