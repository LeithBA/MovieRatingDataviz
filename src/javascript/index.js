

import Mouse from "./utils/mouse"
import Easing from "./utils/easing"
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import DRACOLoader from '../javascript/DRACOLoader.js';
import { TextureEncoding } from "three";


//SETUP
const canvas = document.querySelector('.main-canvas')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const fontLoader = new THREE.FontLoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('../javascript/');
dracoLoader.preload();
gltfLoader.setDRACOLoader(dracoLoader);


let text;


const light = new THREE.DirectionalLight(0xFFFFFF, 1.5);
scene.add(light);

let time = 0;
let currentIndex = 0;
let currentMovie;
let chairs = new Array(500);
let maxRev = 0;

camera.position.x = 0;
camera.position.y = 20;
camera.position.z = 75;
camera.rotateX(-Math.PI / 8);
//DATA
let data;
let dataLoad = d3.csv("/assets/data/data.csv");

dataLoad.then(function (loadedData) {
    data = loadedData;
    data.forEach(movie => {
        let rev = parseInt(movie.revenue);
        if (rev > maxRev) {
            maxRev = rev;
        }
    });
    createChairs();
    loadMovie(currentIndex);
});




const update = () => {
    requestAnimationFrame(update)
    renderer.render(scene, camera);
    time++;
}
requestAnimationFrame(update)

function createChairs() {
    gltfLoader.load(
        './assets/models/chair.glb',
        (gltf) => {
            //console.log(gltf);
            let mesh = gltf.scene;
            let mat = new THREE.MeshPhongMaterial({
                color: 0x880000,    // red (can also use a CSS color string here)
                flatShading: false,
            });

            mesh.children.forEach(sub => {
                sub.material = mat;
            });

            let col = 50;
            let spacing = 10;
            for (let i = 0; i < 500; i++) {
                let c = mesh.clone();
                c.name = "chair_" + i
                chairs[i] = c;
                scene.add(c);
                c.scale.set(0.1, 0.1, 0.1);
                c.rotateY(Math.PI);
                c.position.x = (i % col) * spacing - col * spacing / 2;
                c.position.y = -Math.floor(i / col) * 10
                c.position.z = -100 + Math.floor(i / col) * 10;
            }
            console.log(chairs);
        },
        (xhr) => {
            // called while loading is progressing
            //console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        (error) => {
            // called when loading has errors
            console.error('An error happened', error);
        },
    );

    //console.log(chairs[0]);


}

function loadMovie() {
    currentMovie = data[currentIndex];
    //console.log(data);
    let rev = currentMovie.revenue;
    let amount = Math.floor(rev / maxRev * 500);
    //console.log("amount: " + amount);
    //console.log("chairs length" + chairs.length);
    chairs.forEach(chair => {
        chair.visible = false;
    });

    //console.log(chairs.length);

    let visible = getRandom(chairs, amount)
    visible.forEach(chair => {
        chair.visible = true;
    });


    updateTitle(currentMovie.original_title);

}

function getRandom(arr, n) {
    //console.log(arr);
    var result = new Array(n),
        len = arr.length,
        taken = new Array(arr.length);
    //console.log("n=" + n + " -- l=" + len); 3
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function updateTitle(newTitle) {
    if (text)
        scene.remove(text);

    fontLoader.load('./assets/fonts/Lora/Lora_Regular.json', function (font) {
        let mesh = new THREE.TextGeometry(newTitle, {
            font: font,
            size: 20,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 5
        });
        mesh.center();
        let material = new THREE.MeshPhongMaterial({
            color: 0xffffff,    // red (can also use a CSS color string here)
            flatShading: false,
        });
        text = new THREE.Mesh(mesh, material);
        text.position.x = 0;
        text.position.y = 50;
        text.position.z = -150;
        text.scale.z = 0.1;
        scene.add(text);
    });
}


document.addEventListener("keydown", event => {
    let code = event.keyCode;
    switch (code) {
        case 37:
            if (currentIndex == 0)
                currentIndex = data.length - 1;
            else
                currentIndex--;
            loadMovie();
            break;
        case 39:
            currentIndex = (currentIndex + 1) % data.length;
            loadMovie();
            break;
        default:
            break;
    }
});