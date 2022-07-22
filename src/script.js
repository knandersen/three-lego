import * as THREE from 'three';
import {LDrawLoader} from 'three/examples/jsm/loaders/LDrawLoader'
import {LDrawUtils} from 'three/examples/jsm/utils/LDrawUtils'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'

const marioUrl = new URL("../static/mario.mpd", import.meta.url)

const ldrawLoader = new LDrawLoader();
ldrawLoader.smoothNormals = true;

// set up a renderer
const renderer = new THREE.WebGLRenderer({
	antialias: false
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
// THREE colors look like 0xff00ff, same as #ff00ff
renderer.setClearColor(0xefefef, 1)

// find the element to add the renderer to!
const section = document.querySelector("section")
section.appendChild(renderer.domElement)

// lets create a scene
const scene = new THREE.Scene()

const pmremGenerator = new THREE.PMREMGenerator(renderer)
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

// lets create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.z = -200
camera.position.y = 100
camera.position.x = 50
camera.lookAt(scene.position)

const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

// lets add some lighting
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, -1)
//scene.add(light)

ldrawLoader.load(marioUrl.href, (grp) => {
	console.log(grp);
	//LDrawUtils.mergeObject(grp)
	grp.rotation.x = Math.PI;
	grp.rotation.y = Math.PI;
	scene.add(grp);
}, (xhr) => {
	console.log(xhr.loaded);
}, (err) => {
	console.log(err);
})
// lets add in an animation loop
const animate = function () {
	renderer.render(scene, camera)
	requestAnimationFrame(animate)

	//camera.position.setZ(camera.position.z + 1)

}

// start the animation
animate()

document.addEventListener("mousedown", function (event) {
	//createShape(event.pageX, event.pageY)
})

document.addEventListener("touchstart", function (event) {
    //createShape(event.pageX, event.pageY)
})

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})