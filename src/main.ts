import "./style.css";
import Scene from "./scene";

window.addEventListener("load", () => {
  let docScroll = 0;
  const getPageYScroll = () => (docScroll = window.scrollY || document.documentElement.scrollTop);
  window.addEventListener("scroll", getPageYScroll);
  const image = document.querySelectorAll("img")[0];
  const bounds = image.getBoundingClientRect();
  const fromTop = bounds.top;
  const windowHeight = window.innerHeight;
  const withoutHeight = fromTop - windowHeight;
  const withHeight = fromTop + bounds.height;
  const insideTop = withoutHeight - docScroll;
  const insideRealTop = fromTop + docScroll;
  const insideBottom = withHeight - docScroll + 50;
  const width = bounds.width;
  const height = bounds.height;
  const left = bounds.left;

  const scene = new Scene();
  scene.createMesh({
    image: image.src,
    iWidth: image.width,
    iHeight: image.height,
    width: width,
    height: height,
  });

  scene.render();
});
