import { ThreeMFLoader } from "three/addons/loaders/3MFLoader.js";

// const modelUrl = "https://github.com/DoggySazHi/MiniHakkero.CAD/releases/latest/download/Final.3mf";
const modelUrl = new URL("../img/Final.3mf", import.meta.url).href;
let modelCache = null;

async function loadModelInternal() {
    const loader = new ThreeMFLoader();
    return await loader.loadAsync(modelUrl);
}

export async function loadModel() {
    if (modelCache) {
        return modelCache;
    }

    modelCache = await loadModelInternal();
    return modelCache;
}