import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, iphone, hovered = false;

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    const canvas = document.querySelector('#webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Load iPhone model
    const loader = new GLTFLoader();
    loader.load('/models/ip.glb', function(gltf) {
        iphone = gltf.scene;
        iphone.scale.set(3, 3, 3);
        iphone.position.set(0, 0.163, 0);
        scene.add(iphone);

        // Apply texture to the screen
        iphone.traverse((child) => {
            if (child.isMesh && child.name === "screen") {
                const textureLoader = new THREE.TextureLoader();
                const texture = textureLoader.load('/textures/screen01.png');
                const material = new THREE.MeshBasicMaterial({ map: texture });
                child.material = material;
            }
        });
    }, undefined, function(error) {
        console.error(error);
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Handle mouse events
    document.addEventListener('pointermove', onPointerMove, false);
    document.addEventListener('pointerout', onPointerOut, false);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
    if (iphone) {
        const intersects = getIntersects(event.clientX, event.clientY);
        if (intersects.length > 0) {
            hovered = true;
            document.body.style.cursor = 'pointer';
        } else {
            hovered = false;
            document.body.style.cursor = 'default';
        }
    }
}

function onPointerOut() {
    hovered = false;
    document.body.style.cursor = 'default';
}

function getIntersects(x, y) {
    const mouse = new THREE.Vector2();
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObject(iphone, true);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();
