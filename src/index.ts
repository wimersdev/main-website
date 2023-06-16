import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

console.clear();

const clock = new THREE.Clock();

//Add a new scene
const scene = new THREE.Scene();
const meshGroup = new THREE.Group();
scene.add(meshGroup);
const canvas = document.querySelector('canvas.webgl');

const hdrEquirect = new RGBELoader().load(
  'https://uploads-ssl.webflow.com/6385ed21375f1c00a4a3f887/648c4d384c0f10df3fb5805c_studio_small_08_1k.txt',
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  }
);

//Sizes (canvas sizing)
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.01); //Add a new camera with canvas sized field of view
//camera.position.x = 25;
//camera.position.y = 30;
camera.position.z = 5; //Make camera not centered in axis 0
scene.add(camera); //Add Camera to Scene

const material = new THREE.MeshPhysicalMaterial({
  color: 0x222fff,
  roughness: 0.05,
  transmission: 0.7,
  thickness: 1,
  envMap: hdrEquirect,
  envMapIntensity: 0.5,
});

const object = new THREE.Object3D();

// На верхнем уровне
const clones = [];

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  'https://uploads-ssl.webflow.com/6385ed21375f1c00a4a3f887/648c4a2e4f99b8ac202ee817_slash.txt',
  (gltf) => {
    const slash = gltf.scene.children[0].geometry;
    const bufferMesh = new THREE.Mesh(slash, material);
    object.add(bufferMesh);

    const cloneCount = 50; // количество клонов
    const randomRange = 15; // диапазон расположения клонов

    for (let i = 0; i < cloneCount; i++) {
      const modelClone = object.clone();

      // Создание случайной позиции в пределах заданного диапазона
      const randomX = Math.random() * randomRange - randomRange / 2;
      const randomY = Math.random() * randomRange - randomRange / 2;
      const randomZ = Math.random() * randomRange - randomRange / 2;

      // Установка новой позиции для клона
      modelClone.position.set(randomX, randomY, randomZ);
      modelClone.rotation.set(randomX, randomY, randomZ);

      modelClone.userData.offset = Math.random() * 7 * Math.PI; // случайное смещение от 0 до 2Пи
      clones.push(modelClone); // добавление клонов в массив
      scene.add(modelClone);
    }
  }
);

// lights
const ambientLight = new THREE.AmbientLight(0x1792ff, 0.25);
//scene.add(ambientLight);
const skyColor = 0x0087ff; // light blue
const groundColor = 0xda6c48; // brownish
const light = new THREE.HemisphereLight(skyColor, groundColor, 0.25);
light.position.set(0, 5, 0);
scene.add(light);

//Renderer
const renderer = new THREE.WebGLRenderer({
  //Create renderer
  canvas: canvas,
  alpha: true,
});

renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height); //Set size for renderer
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const controls = new OrbitControls(camera, canvas); //Add Orbit Camera
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enabled = false;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Вращение и движение каждого клона
  clones.forEach((clone) => {
    clone.rotation.y += 0.0025; // более плавное вращение
    clone.position.y += (Math.sin(elapsedTime + clone.userData.offset) / 2) * 0.01; // добавление движения
  });

  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
  });

  // Обновление OrbitControls
  controls.update();

  // Рендеринг сцены
  renderer.render(scene, camera);

  // Вызов tick на следующем кадре
  window.requestAnimationFrame(tick);
};

tick();
