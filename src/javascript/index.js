

import Mouse from "./utils/mouse"
import Easing from "./utils/easing"
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import DRACOLoader from '../javascript/DRACOLoader.js';
import { MOUSE, TextureEncoding } from "three";
import Stats from 'stats.js';

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

//SETUP
const canvas = document.querySelector('.main-canvas')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20.4, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const fontLoader = new THREE.FontLoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('../javascript/');
dracoLoader.preload();
gltfLoader.setDRACOLoader(dracoLoader);


const title = document.getElementById("title");
const subTitle = document.getElementById("subTitle");
const info = document.getElementById("info");

let AmbientLight = new THREE.AmbientLight(0x000000); // soft white light
scene.add(AmbientLight);

const spot = new THREE.SpotLight(0xffffff, 1.2, 0, Math.PI / 4, 0.5, 20);
spot.position.set(0, 100, 50);
spot.target.position.set(0, -200, 0);
spot.castShadow = true;
scene.add(spot);
scene.add(spot.target);

let time = 0;
let currentIndex = 0;
let currentMovie;
let chairs = new Array(400);
let maxRev = 0;

let camBasePos = new THREE.Vector3(0, -30, 285);
//camBasePos = new THREE.Vector3(800, -100, 0); //DEBUG CAMERA
camera.rotateX(-Math.PI / 32);
//DATA
let data;
let dataLoad = d3.csv("/assets/data/data.csv"); //TYPE: PROMISE

dataLoad.then(function (loadedData) {
    data = loadedData;
    for (let i = 0; i < data.length; i++) {
        let movie = data[i];
        let rev = parseInt(movie.revenue);
        if (rev < 1) {
            data.splice(i, 1);
            i--;
        }
        if (rev > maxRev) {
            maxRev = rev;
        }
    }
    console.log(data.length + " movies loaded");
    addAssets();
    loadMovie(currentIndex);
});




const update = () => {
    stats.begin();

    camera.position.lerpVectors(camera.position, camBasePos, 0.08);
    let mouseX = Mouse.cursor[0];
    let mouseY = Mouse.cursor[1];
    camera.lookAt(camera.position.x + mouseX, camera.position.y - mouseY - 20, camera.position.z - 200)
    //camera.lookAt(0, 0, 0); //DEBUG CAMERA
    renderer.render(scene, camera);
    time += 0.01;

    stats.end();
    requestAnimationFrame(update);
}
requestAnimationFrame(update)

function addAssets() {
    createChairs();
    createStairs();
    createDoors();
}

function createChairs() {
    gltfLoader.load(
        './assets/models/Cinema-parts/Seat.gltf',
        (gltf) => {
            let chair = gltf.scene.children[0];
            chair.castShadow = true;
            chair.rotateZ(Math.PI);
            let mat = new THREE.MeshPhongMaterial({
                color: 0x880000,    // red (can also use a CSS color string here)
                flatShading: false,
                shininess: 5,
            });
            chair.material = mat;
            let col = 28;
            let spacingX = 5.5;
            let spacingY = 2;
            let spacingZ = spacingY * 4;
            let gap = 10;
            let offsetX = 3;
            for (let i = 0; i < chairs.length; i++) {
                let c = chair.clone();
                c.name = "chair_" + i
                chairs[i] = c;
                scene.add(c);
                c.scale.set(0.1, 0.1, 0.1);
                if (i < 8) {
                    c.position.x = (i % 8) * spacingX - 8 * spacingX / 2 + offsetX;
                    c.position.y = -100 - spacingY;
                    c.position.z = -10 + spacingZ;
                }
                else {
                    let xPlacement = ((i - 8) % col);
                    let g = 0;
                    if (xPlacement < 4)
                        g = -gap;
                    else if (xPlacement >= 24)
                        g = gap;

                    c.position.x = xPlacement * spacingX - col * spacingX / 2 + g + offsetX;
                    c.position.y = -100 + Math.floor((i - 8) / col) * spacingY;
                    c.position.z = -10 - Math.floor((i - 8) / col) * spacingZ;
                }
            }
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



}

function createStairs() {
    gltfLoader.load(
        './assets/models/Cinema-parts/Stairs.gltf',
        (gltf) => {
            //console.log(gltf);
            let stairs = gltf.scene.children[0];
            let mat = new THREE.MeshPhongMaterial({
                color: 0x101010,    // red (can also use a CSS color string here)
                flatShading: true,
                shininess: 50,
            });
            stairs.material = mat;
            stairs.rotateX(Math.PI * 2);
            stairs.rotateZ(Math.PI);
            stairs.position.y = -97;
            stairs.position.z = 0;
            stairs.scale.set(0.1, 0.1, 0.1);
            stairs.receiveShadow = true;
            scene.add(stairs);

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


}

function createDoors() {
    let geometry = new THREE.PlaneGeometry(10, 14, 1);
    let material = new THREE.MeshPhongMaterial({
        color: 0x202020,    // red (can also use a CSS color string here)
        flatShading: true,
        shininess: 15,
    });
    let door = new THREE.Mesh(geometry, material);
    door.position.x = 62;
    door.position.y = -70;
    door.position.z = -125;
    scene.add(door);

    geometry = new THREE.PlaneGeometry(3, 0.6, 1);
    material = new THREE.MeshPhongMaterial({
        emissive: 0x00ee00,
        flatShading: true,
        shininess: 0,
    });
    let doorLight = new THREE.Mesh(geometry, material);
    doorLight.position.x = door.position.x;
    doorLight.position.y = door.position.y + 9;
    doorLight.position.z = door.position.z;
    scene.add(doorLight);

    var pointLight1 = new THREE.PointLight(0xfff00, 1, 100);
    pointLight1.position.x = doorLight.position.x;
    pointLight1.position.y = doorLight.position.y;
    pointLight1.position.z = doorLight.position.z + 1;
    scene.add(pointLight1);


    var pointLight2 = new THREE.PointLight(0xfff00, 1, 100);
    pointLight2.position.x = -85;
    pointLight2.position.y = -90;
    pointLight2.position.z = 0;
    scene.add(pointLight2);
}

function loadMovie() {
    currentMovie = data[currentIndex];
    //console.log(data);
    let rev = currentMovie.revenue;
    let amount = Math.floor(rev / maxRev * chairs.length);
    //console.log("amount: " + amount);
    //console.log("chairs length" + chairs.length);
    chairs.forEach(chair => {
        if (chair == undefined) return;
        chair.visible = false;
    });


    let visible = getRandom(chairs, amount)
    visible.forEach(chair => {
        if (chair == undefined) return;
        chair.visible = true;
    });


    updateText();
}

function getRandom(arr, n) {
    //console.log(arr);
    let result = new Array(n),
        len = arr.length,
        taken = new Array(arr.length);
    //console.log("n=" + n + " -- l=" + len); 3
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function updateText() {
    title.textContent = currentMovie.original_title;
    let tag = currentMovie.tagline;
    let rev = new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD' }).format(currentMovie.revenue).replaceAll("US", "");
    let date = currentMovie.release_date;

    subTitle.textContent = tag.slice(0, -1);

    info.textContent = rev;// + "  -  " + date;
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


window.addEventListener("resize", function () {
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});
