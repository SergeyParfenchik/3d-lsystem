import * as THREE from 'three';

export function buildBranches(path) {
    if (!path?.length) return new THREE.Group();

    const material = new THREE.MeshStandardMaterial({ 
        color: 0x12af56,
        flatShading: true
    });

    // Создаем основную геометрию для объединения
    const mergedGeometry = new THREE.BufferGeometry();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const tempVector = new THREE.Vector3();
    const tempDir = new THREE.Vector3();
    const tempMatrix = new THREE.Matrix4();
    const tempQuaternion = new THREE.Quaternion();

    // Временные массивы для атрибутов
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let vertexOffset = 0;

    for (const segment of path) {
        tempDir.subVectors(segment.to, segment.from);
        const length = tempDir.length();
        if (length < 0.001) continue;

        // Параметры цилиндра
        const startRadius = segment.startRadius || 0.2;
        const endRadius = segment.endRadius || 0.1;
        const radialSegments = 8;
        const heightSegments = 1;

        // Создаем временную геометрию
        const geometry = new THREE.CylinderGeometry(
            endRadius,
            startRadius,
            length,
            radialSegments,
            heightSegments,
            false
        );

        // Применяем трансформацию
        tempVector.copy(segment.from)
            .add(tempDir.clone().multiplyScalar(0.5));
        tempQuaternion.setFromUnitVectors(
            yAxis,
            tempDir.clone().normalize()
        );
        tempMatrix.compose(
            tempVector,
            tempQuaternion,
            new THREE.Vector3(1, 1, 1)
        );
        geometry.applyMatrix4(tempMatrix);

        // Переносим данные в основную геометрию
        const posAttr = geometry.attributes.position;
        const normalAttr = geometry.attributes.normal;
        const uvAttr = geometry.attributes.uv;
        const indexAttr = geometry.index;

        // Добавляем вершины
        for (let i = 0; i < posAttr.count; i++) {
            positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            normals.push(normalAttr.getX(i), normalAttr.getY(i), normalAttr.getZ(i));
            uvs.push(uvAttr.getX(i), uvAttr.getY(i));
        }

        // Добавляем индексы с учетом смещения
        for (let i = 0; i < indexAttr.count; i++) {
            indices.push(indexAttr.getX(i) + vertexOffset);
        }

        vertexOffset += posAttr.count;
        geometry.dispose();
    }

    if (positions.length === 0) return new THREE.Group();

    // Устанавливаем атрибуты финальной геометрии
    mergedGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    mergedGeometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normals, 3)
    );
    mergedGeometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
    );
    mergedGeometry.setIndex(indices);

    return new THREE.Mesh(mergedGeometry, material);
}



   // */