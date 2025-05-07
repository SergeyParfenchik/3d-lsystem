import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { LSystem } from './core/LSystem.js';
import { Turtle3D } from './core/Turtle3D.js';
import { buildBranches } from './core/MeshBuilder.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddffee);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(4, 2, 3);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // цвет и интенсивность
scene.add(ambientLight);

const axiom = 'FA';
const rules = {
    A: "F[^S]F[&S]FS",
    S: "F[*A]F[/A]FA",
    F: "JF",
};
const iterations = 7;

const lsys = new LSystem(axiom, rules, iterations);
const result = lsys.generate();

const turtle = new Turtle3D(Math.PI / 7, 0.06, 0.15, 0.003); 
const segments = turtle.interpret(result);

const tree = buildBranches(segments);
scene.add(tree);


function animate() {
    requestAnimationFrame(animate);
    // tree.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}

animate();