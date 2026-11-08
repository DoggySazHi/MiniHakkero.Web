import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadModel } from "./model-loader.js";

let model = null;
let composer = null;

if (!WebGL.isWebGL2Available()) {
    console.error("WebGL2 not available :(");
    // Use webp fallback
} else {
    await init();
}

async function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    model = await loadModel();
    const scaleFactor = 30;
    // Add outline effect to all parts
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.colorWrite = false; // Do not render the original mesh color

            const edges = new THREE.EdgesGeometry(child.geometry, 30); // Edge detection, 30 degrees (doesn't really matter since it's mostly sharp angles)
            const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
            child.add(lines);
        }
    });
    scene.add(model);

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);

    // Outline pass to make the entire model pop out
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.selectedObjects = [model];
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 0.0;
    outlinePass.edgeThickness = 1.0;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#000000');
    composer.addPass(outlinePass);
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    camera.position.z = 5;
}

function animate(time) {
    if (!model || !composer) {
        // Waiting for asynchronous loading...
        return;
    }

    model.rotation.set(time / 2000, time / 1000, 0);
    model.position.set(0, 0.2 * Math.sin(time / 1000), 0);

    composer.render();
}
