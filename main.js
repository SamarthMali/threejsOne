import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";

const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widhtSegments: 50,
    heightSegments: 50,
  },
};
gui.add(world.plane, "width", 1, 500).onChange(() => {
  generatePlane();
});

gui.add(world.plane, "height", 1, 500).onChange(() => {
  generatePlane();
});

gui.add(world.plane, "widhtSegments", 1, 100).onChange(() => {
  generatePlane();
});

gui.add(world.plane, "heightSegments", 1, 100).onChange(() => {
  generatePlane();
});

const scean = new THREE.Scene();

const rayCaster = new THREE.Raycaster();

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widhtSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

scean.add(planeMesh);
generatePlane();

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widhtSegments,
    world.plane.heightSegments
  );
  const randomValue = []
  const { array } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i ++) {
    if(i % 3 ==0 ){

    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
    array[i] = x + (Math.random() - 0.5);
    array[i + 1] = y + (Math.random() - 0.5) ;
    array[i + 2] = z + (Math.random() - 0.5) * 5;
  }
  randomValue.push(Math.random() * Math.PI * 5)

planeMesh.geometry.attributes.position.randomValue = randomValue
    planeMesh.geometry.attributes.position.originalPosition = 
    planeMesh.geometry.attributes.position.array
  }

  const color = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    color.push(0, 0.10, 0.4);
  }

  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(color), 3)
  );
}

console.log();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scean.add(light);

const backlight = new THREE.DirectionalLight(0xffffff, 1);
backlight.position.set(0, 0, -1);
scean.add(backlight);

camera.position.z = 50;
renderer.setPixelRatio(devicePixelRatio);
const mouse = {
  x: undefined,
  y: undefined,
};
let frame = 0
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scean, camera);
  rayCaster.setFromCamera(mouse, camera);
  frame += 0.01

  const {array, originalPosition, randomValue} = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i+=3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValue[i]) * 0.0099
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValue[i + 1]) * 0.0099
  }
  planeMesh.geometry.attributes.position.needsUpdate = true
  const intersects = rayCaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    console.log("intersecting");
    const { color } = intersects[0].object.geometry.attributes;
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.10,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.2,
      b: 1,
    };
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);

        color.needsUpdate = true;
      },
    });
  }
}

animate();

addEventListener("mousemove", (ev) => {
  mouse.x = (ev.clientX / innerWidth) * 2 - 1;
  mouse.y = -(ev.clientY / innerHeight) * 2 + 1;
});
