import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

//Add a new scene

const loader = new THREE.TextureLoader();

function hero3d() {
  const scene = new THREE.Scene();
  const canvas = document.querySelector('canvas.webgl');

  //Add a object scale value (less-bigger object)
  const scaleValue = 600;

  //Init RGBE Loader for HDRI environment map (better to change to cubemap)
  const envMap = new RGBELoader().load(
    'https://uploads-ssl.webflow.com/6385ed21375f1c00a4a3f887/63f4b3177336d31122b5d801_03.txt',
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.backgroundIntensity = 1;
    }
  );
  /*
  //Glass shader
  const material = new THREE.RawShaderMaterial({
    vertexShader: ``,
    fragmentShader: ``,
  });
  */
  //Add glass material
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0,
    transmission: 1,
    thickness: 1,
    envMap: envMap,
  });

  const canvasHolder = document.getElementById('canvasholder');

  //Sizes (canvas sizing)
  const sizes = {
    width: canvasHolder.offsetWidth,
    height: canvasHolder.offsetHeight,
  };

  //Add a group for mesh manipulations
  const meshGroup = new THREE.Group();
  meshGroup.scale.x = sizes.width / scaleValue; //Set the scale values for meshGroup
  meshGroup.scale.y = sizes.width / scaleValue;
  meshGroup.scale.z = sizes.width / scaleValue;
  scene.add(meshGroup);

  //Init GLTF Loader for 3d models
  const gltfLoader = new GLTFLoader();

  //Load cube
  gltfLoader.load(
    'https://uploads-ssl.webflow.com/6385ed21375f1c00a4a3f887/63f4b317da759861bfc961d6_cube-glass-test.txt',
    (gltf) => {
      const cube = gltf.scene.children[0];
      const geometry = cube.geometry.clone();
      const mesh = new THREE.Mesh(geometry, material);
      meshGroup.add(mesh);
    }
  );

  //Camera
  const aspectRatio = sizes.width / sizes.height;
  const camera = new THREE.PerspectiveCamera(10, aspectRatio);
  camera.position.z = 30; //Make camera not centered in axis 0
  camera.position.y = 15; //add camera angle
  scene.add(camera); //Add Camera to Scene

  //Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  //Render Target
  const parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
  };

  const renderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height, parameters);

  //Post processing
  const effectComposer = new EffectComposer(renderer, renderTarget);
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  //Add render passes
  const renderPass = new RenderPass(scene, camera);
  effectComposer.addPass(renderPass);

  //Add bloom
  const bloom = new UnrealBloomPass();
  bloom.threshhold = 0;
  bloom.resolution = 3;
  bloom.radius = 0.2;
  bloom.strength = 1;
  bloom.transmission = 1;
  //effectComposer.addPass(bloom);

  //Renderer config
  renderer.setSize(sizes.width, sizes.height); //Set size for renderer
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.7;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.antialias = true;

  //When window resizing
  window.addEventListener('resize', () => {
    // Update sizes
    //Sizes (canvas sizing)
    const sizes = {
      width: canvasHolder.offsetWidth,
      height: canvasHolder.offsetHeight,
    };
    meshGroup.scale.x = sizes.width / scaleValue;
    meshGroup.scale.y = sizes.width / scaleValue;
    meshGroup.scale.z = sizes.width / scaleValue;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
  });

  //Orbitcontrols
  const controls = new OrbitControls(camera, canvas); //Add Orbit Camera
  controls.autoRotate = true;
  controls.autoRotateSpeed = 3;
  controls.enabled = false;

  //Animation render
  const tick = () =>
    //Function allows to refresh screen every frame
    {
      // Render
      //renderer.render(scene, camera)
      controls.update();
      effectComposer.render();

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

  tick();
}

hero3d();
