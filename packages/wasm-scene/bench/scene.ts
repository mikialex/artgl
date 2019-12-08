import * as THREE from './node_modules/three/src/Three'
import { Renderer } from '../client/renderer';
import { WasmSceneGraph } from '../client/wasm-scene-graph';
import { Quaternion, Euler, Object3D } from './node_modules/three/src/Three';

export function intoThree() {

    const canvas = document.querySelector('#three')! as HTMLCanvasElement
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    var renderer = new THREE.WebGLRenderer({
        canvas
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const geom = new THREE.BoxBufferGeometry();
    const mat = new THREE.MeshBasicMaterial();

    const arraySize = 5;
    console.log(arraySize * arraySize * arraySize);
    const grid = 1;
    for (let i = 0; i < arraySize; i++) {
        const node = new THREE.Object3D();
        node.position.x = i * grid;
        scene.add(node);
        for (let j = 0; j < arraySize; j++) {
            const node2 = new THREE.Object3D();
            node2.position.y = j * grid;
            node.add(node2);
            for (let k = 0; k < arraySize; k++) {

                const testMesh = new THREE.Mesh(geom, mat);
                testMesh.position.z = k * grid;
                testMesh.scale.set(0.3, 0.3, 0.3);
                testMesh.frustumCulled = false;
                node2.add(testMesh);
            }
        }
    }

    var animate = function () {
        requestAnimationFrame(animate);

        scene.rotation.x += 0.01;
        scene.rotation.y += 0.01;

        renderer.render(scene, camera);
    };

    animate();

}

export function intoWasmScene() {
    const canvas = document.querySelector('#wasm')! as HTMLCanvasElement
    const renderer = new Renderer(canvas);
    console.log(renderer)
    const scene = new WasmSceneGraph();

    // const shading = scene.createShading(
    //     `            
    //         attribute vec4 position;
    //         void main() {
    //             gl_Position = position;
    //         }
    //         `,
    //     `
    //         void main() {
    //             gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    //         }
    //     `
    // );
    const shading = scene.createShading('test');
    const data = new Float32Array([-0.7, -0.7, 0.0, 0.7, -0.7, 0.0, 0.0, 0.7, 0.0]);
    const positionbuffer = scene.createNewBuffer(data, 3);
    const geometry = scene.createNewGeometry(positionbuffer)
    const renderable = scene.createRenderObject(shading, geometry)

    const arraySize = 5;
    console.log(arraySize * arraySize * arraySize);
    const grid = 1;
    for (let i = 0; i < arraySize; i++) {
        const node = scene.createNewNode();
        node.setPosition(i * grid, 0, 0);
        scene.root.add(node);
        for (let j = 0; j < arraySize; j++) {
            const node2 = scene.createNewNode();
            node2.setPosition(0, j * grid, 0);
            node.add(node2);
            for (let k = 0; k < arraySize; k++) {
                const node3 = scene.createNewNode();
                node3.setPosition(0, 0, k * grid);
                node3.renderObject = renderable;
                node2.add(node3);
            }
        }
    }

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 50;
    camera.updateMatrix();
    scene.useProjection(new Float32Array(camera.projectionMatrix.elements));

    const o3d = new Object3D();

    var animate = function () {
        requestAnimationFrame(animate);

        o3d.rotation.y += 0.01;
        scene.root.setRotation(o3d.quaternion.x, o3d.quaternion.y, o3d.quaternion.z, o3d.quaternion.w);

        renderer.render(scene);
    };

    animate();
}