import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { LSystem } from './core/LSystem.js';
import { Turtle3D } from './core/Turtle3D.js';
import { buildBranches } from './core/MeshBuilder.js';

// Глобальные переменные для управления деревом
let currentTree = null;



const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF6FCDF);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
    75, 
    (window.innerWidth/5*4) / window.innerHeight,
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

const turtle = new Turtle3D(Math.PI / 6.5, 0.07, 0.15, 0.002); 
const segments = turtle.interpret(result);

const tree = buildBranches(segments);
// scene.add(tree);
currentTree = tree;
scene.add(currentTree);

// Заполняем поля формы начальными значениями
document.getElementById('start').value = axiom;
document.getElementById('angle').value = (Math.PI / 6.5 * 180 / Math.PI).toFixed(2); // Конвертируем радианы в градусы
document.getElementById('iterations').value = iterations;
document.getElementById('length').value = 0.07;
document.getElementById('startWidth').value = 0.15;
document.getElementById('endWidth').value = 0.002;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function generateTree() {
    // 1. Получаем параметры из UI
    const axiom = document.getElementById('start').value;
    const iterations = parseInt(document.getElementById('iterations').value);
    const angle = parseFloat(document.getElementById('angle').value);
    const length = parseFloat(document.getElementById('length').value);
    const startWidth = parseFloat(document.getElementById('startWidth').value);
    const endWidth = parseFloat(document.getElementById('endWidth').value);

    // 2. Генерируем L-систему
    const lsys = new LSystem(axiom, rules, iterations);
    const result = lsys.generate();

    // 3. Создаем 3D-дерево
    const turtle = new Turtle3D(
        THREE.MathUtils.degToRad(angle),
        length,
        startWidth,
        endWidth
    );
    const segments = turtle.interpret(result);

    // 4. Обновляем сцену
    if (currentTree) scene.remove(currentTree);
    currentTree = buildBranches(segments);
    scene.add(currentTree);
}

function updateRulesFromUI() {
    const newRules = {};
    document.querySelectorAll('#rulesTable tbody tr').forEach(row => {
        const keyInput = row.querySelector('.rule-key');
        const valueInput = row.querySelector('.rule-value');
        if (keyInput?.value && valueInput?.value) {
            newRules[keyInput.value] = valueInput.value;
        }
    });
    Object.assign(rules, newRules);
    generateTree();
}

function initRulesTable() {
    const tbody = document.querySelector('#rulesTable tbody');
    tbody.innerHTML = '';

    // Добавляем существующие правила из переменной rules
    for (const [key, rule] of Object.entries(rules)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2 border">
                <input value="${key}" class="w-full px-2 py-1 border rounded rule-key">
            </td>
            <td class="p-2 border">
                <input value="${rule}" class="w-full px-2 py-1 border rounded rule-value">
            </td>
            <td class="p-2 border">
                <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 delete-rule">×</button>
            </td>
        `;
        tbody.appendChild(row);
    }

    // Добавляем строку для новых правил
    addNewRuleRow();
}

function addRuleToTable(key, rule) {
    const tbody = document.querySelector('#rulesTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="p-2 border">
            <input value="${key}" class="w-full px-2 py-1 border rounded rule-key">
        </td>
        <td class="p-2 border">
            <input value="${rule}" class="w-full px-2 py-1 border rounded rule-value">
        </td>
        <td class="p-2 border">
            <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 delete-rule">×</button>
        </td>
    `;
    tbody.insertBefore(row, tbody.lastElementChild);
}

function addNewRuleRow() {
    const tbody = document.querySelector('#rulesTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="p-2 border"><input id="newRuleKey" placeholder="Символ" class="w-full px-2 py-1 border rounded"></td>
        <td class="p-2 border"><input id="newRuleValue" placeholder="Правило" class="w-full px-2 py-1 border rounded"></td>
        <td class="p-2 border">
            <button id="addRuleBtn" class="w-full px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">+</button>
        </td>
    `;
    tbody.appendChild(row);
}

document.addEventListener('click', (e) => {
    if (e.target?.id === 'addRuleBtn') {
        e.preventDefault();
        const key = document.getElementById('newRuleKey').value.trim();
        const rule = document.getElementById('newRuleValue').value.trim();
        if (key && rule) {
            rules[key] = rule;
            addRuleToTable(key, rule);
            document.getElementById('newRuleKey').value = '';
            document.getElementById('newRuleValue').value = '';
            generateTree();
            
            // Пересоздаем строку для новых правил
            e.target.closest('tr').remove();
            addNewRuleRow();
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target?.classList.contains('delete-rule')) {
        e.target.closest('tr').remove();
        updateRulesFromUI();
    }
});

document.addEventListener('change', (e) => {
    if (e.target?.classList.contains('rule-key') || e.target?.classList.contains('rule-value')) {
        updateRulesFromUI();
    }
});

// Инициализация при загрузке
initRulesTable();
document.getElementById('updateBtn').addEventListener('click', generateTree);

animate();

