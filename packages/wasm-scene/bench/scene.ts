import * as THREE from './node_modules/three/src/Three'

export function intoThree() {

    
    // const renderer = new THREE.WebGLRenderer({
    //     canvas: document.querySelector('#three')! as HTMLCanvasElement
    // });

    // const scene = new THREE.Scene();
    // const geom = new THREE.BoxBufferGeometry();


    // const arraySize = 20;
    // console.log(arraySize * arraySize * arraySize);
    // const grid = 1;
    // for (let i = 0; i < arraySize; i++) {
    //     const node = new THREE.Object3D();
    //     node.position.x = i * grid;
    //     scene.add(node);
    //     for (let j = 0; j < arraySize; j++) {
    //         const node2 = new THREE.Object3D();
    //         node2.position.y = j * grid;
    //         node.add(node2);
    //         for (let k = 0; k < arraySize; k++) {

    //             const testMesh = new THREE.Mesh();
    //             testMesh.geometry = geom;
    //             testMesh.position.z = k * grid;
    //             testMesh.scale.set(0.3, 0.3, 0.3);
    //             node2.add(testMesh);
    //         }
    //     }
    // }

    // const camera = new THREE.PerspectiveCamera();

    // renderer.render(scene, camera);

    const canvas = document.querySelector('#three')! as HTMLCanvasElement
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75,  canvas.clientWidth/ canvas.clientHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer({
        canvas
    });
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );

    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // var cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );

    const geom = new THREE.BoxBufferGeometry();


    const arraySize = 20;
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

                const testMesh = new THREE.Mesh();
                testMesh.geometry = geom;
                testMesh.position.z = k * grid;
                testMesh.scale.set(0.3, 0.3, 0.3);
                testMesh.frustumCulled = false;
                node2.add(testMesh);
            }
        }
    }

    camera.position.z = 50;

    var animate = function () {
        requestAnimationFrame( animate );

        scene.rotation.x += 0.01;
        scene.rotation.y += 0.01;

        renderer.render( scene, camera );
    };

    animate();

}