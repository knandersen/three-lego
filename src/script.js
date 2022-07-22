import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import Model from './Model';
import Container from './Container';

const marioUrl = new URL("../assets/mario.mpd", import.meta.url)
const hubUrl = new URL("../assets/hub3.mpd", import.meta.url)
const carUrl = new URL("../assets/car.mpd", import.meta.url)
const motorUrl = new URL("../assets/54696p01c01.mpd", import.meta.url)

const ldrawLoader = new LDrawLoader();
ldrawLoader.smoothNormals = true;

// set up a renderer
const renderer = new THREE.WebGLRenderer({
	antialias: false
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
// THREE colors look like 0xff00ff, same as #ff00ff
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// find the element to add the renderer to!
const section = document.querySelector("section")
section.appendChild(renderer.domElement)

const stats = new Stats()
section.appendChild(stats.dom)

// lets create a scene
const scene = new THREE.Scene()

const pmremGenerator = new THREE.PMREMGenerator(renderer)
scene.background = new THREE.Color( 0x777777 );
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

// lets create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.z = -200
camera.position.y = 100
camera.position.x = 50
camera.lookAt(scene.position)

const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

// set up world

const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
  })
const cannonDebugger = new CannonDebugger(scene,world)

// Create a slippery material (friction coefficient = 0.0)
physicsMaterial = new CANNON.Material("slipperyMaterial");
var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
														physicsMaterial,
											);
// We must add the contact materials to the world
world.addContactMaterial(physicsContactMaterial);

/* const groundShape = new CANNON.Plane()
const wallShape = new CANNON.
const groundBody = new CANNON.Body({
	type: CANNON.Body.STATIC,
	shape: groundShape,
  })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
  world.addBody(groundBody) */
  
  const worldSize = 1000;
  const container = new Container(new THREE.Vector3(worldSize/2,worldSize/2,worldSize/2),world)

const groundGeometry = new THREE.PlaneGeometry(worldSize,worldSize,50,50)
groundGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2))
const groundMaterial = new THREE.MeshLambertMaterial({color:0xffffff})
const groundMesh = new THREE.Mesh(groundGeometry,groundMaterial)
scene.add(groundMesh)

// reset camera
const bbox = new THREE.Box3().setFromCenterAndSize(
	new THREE.Vector3(0,worldSize/2,0),
	new THREE.Vector3(worldSize,worldSize,worldSize))
const bboxHelper = new THREE.Box3Helper(bbox,0x0000ff)
scene.add(bboxHelper)
const size = bbox.getSize( new THREE.Vector3() );
const radius = Math.max( size.x, Math.max( size.y, size.z ) ) * 0.5;

controls.target0.copy( bbox.getCenter( new THREE.Vector3() ) );
controls.position0.set( - 2.3, 1, 2 ).multiplyScalar( radius ).add( controls.target0 );
controls.reset();

// load models
let models = []

const modelOptions = {
	world: world,
	scene: scene,
	loader: ldrawLoader
}

const mario = new Model(marioUrl.href,modelOptions)
models.push(mario)

const hub = new Model(hubUrl.href,modelOptions)
models.push(hub)

const motor = new Model(motorUrl.href,modelOptions)
models.push(motor)

const car = new Model(carUrl.href,modelOptions)
models.push(car)

// lets add in an animation loop
const stepLength = 0.1
const animate = function () {
	renderer.render(scene, camera)
	requestAnimationFrame(animate)
	
	stats.update()
	//cannonDebugger.update()
	world.step(stepLength)
   	for(model of models) {
		model.update()
	}
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