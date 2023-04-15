import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

//Add a new scene

function hero3d() {
  const scene = new THREE.Scene();
  const canvas = document.querySelector('canvas.webgl');

  //Add a object scale value (less-bigger object)
  const scaleValue = 600;

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
  meshGroup.position.x = 1.5;
  scene.add(meshGroup);

  const meshGroup2 = new THREE.Group();
  meshGroup.scale.x = sizes.width / scaleValue; //Set the scale values for meshGroup
  meshGroup.scale.y = sizes.width / scaleValue;
  meshGroup.scale.z = sizes.width / scaleValue;
  meshGroup2.rotation.x = -0.5;
  scene.add(meshGroup2);

  //Init GLTF Loader for 3d models
  const gltfLoader = new GLTFLoader();

  // Load the 3D model
  gltfLoader.load(
    'https://uploads-ssl.webflow.com/6385ed21375f1c00a4a3f887/63f4b317da759861bfc961d6_cube-glass-test.txt',
    (gltf) => {
      // Create a geometry to store the vertices of the model
      const geometry = new THREE.BufferGeometry();

      // Traverse the model's geometry and extract vertices
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const vertices = child.geometry.attributes.position.array;
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        }
      });

      // Create a PointsMaterial for the point cloud
      const material = new THREE.PointsMaterial({
        color: 0x000000,
        size: 0.15,
      });

      // Create the point cloud using the extracted vertices and material
      const pointCloud = new THREE.Points(geometry, material);
      const pointsScale = 0.5;
      pointCloud.scale.x = pointsScale;
      pointCloud.scale.y = pointsScale;
      pointCloud.scale.z = pointsScale;

      // Add the point cloud to the scene
      meshGroup.add(pointCloud);
    }
  );

  const material = new THREE.MeshBasicMaterial({
    color: 0xd7d7d7,
    wireframe: true,
    //side: THREE.DoubleSided,
  });

  //Load cube
  gltfLoader.load(
    'https://uploads-ssl.webflow.com/6385ed21375f1c00a4a3f887/643948a6cee32054fd9c76e7_arena2.txt',
    (gltf) => {
      const cube = gltf.scene.children[0];
      const geometry = cube.geometry.clone();
      const mesh = new THREE.Mesh(geometry, material);
      const meshScale = 32;

      mesh.scale.x = meshScale;
      mesh.scale.y = meshScale / 4;
      mesh.scale.z = meshScale;

      meshGroup2.add(mesh);
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

  //Renderer config
  renderer.setSize(sizes.width, sizes.height); //Set size for renderer
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));

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

    meshGroup2.scale.x = sizes.width / scaleValue;
    meshGroup2.scale.y = sizes.width / scaleValue;
    meshGroup2.scale.z = sizes.width / scaleValue;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
  });

  //Orbitcontrols
  const controls = new OrbitControls(camera, canvas); //Add Orbit Camera

  controls.enabled = true;

  //Animation render
  const tick = () =>
    //Function allows to refresh screen every frame
    {
      meshGroup.rotation.y += 0.0015;
      meshGroup.rotation.x += 0.0015;
      meshGroup.rotation.z += 0.0015;

      meshGroup2.rotation.y += 0.0015;
      // Render
      renderer.render(scene, camera);
      controls.update();

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

  tick();
}

hero3d();
