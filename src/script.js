import * as THREE from 'three';
import {LDrawLoader} from 'three/examples/jsm/loaders/LDrawLoader'
import {LDrawUtils} from 'three/examples/jsm/utils/LDrawUtils'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { Object3D, Vector3 } from 'three';

const marioUrl = new URL("../assets/mario.mpd", import.meta.url)

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

const groundShape = new CANNON.Plane()
const groundBody = new CANNON.Body({
	type: CANNON.Body.STATIC,
	shape: groundShape,
  })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
  world.addBody(groundBody)

const groundGeometry = new THREE.PlaneGeometry(500,500,50,50)
//groundGeometry.rotateX(-Math.PI/2)
groundGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2))
const groundMaterial = new THREE.MeshLambertMaterial({color:0xffffff})
const groundMesh = new THREE.Mesh(groundGeometry,groundMaterial)
scene.add(groundMesh)

let model = null
let modelBody = null
let modelLoaded = false

ldrawLoader.load(marioUrl.href, (grp) => {
	modelLoaded = true
	LDrawUtils.mergeObject(grp)
	model = grp
	const bbox = new THREE.Box3().setFromObject(model)
		
	modelBody = new CANNON.Body({mass: 2})
	
	for(let part of model.children) {
		const bbox = new THREE.Box3().setFromObject(part)
		const box = new CANNON.Box(bbox.getSize(bbox.getCenter(new THREE.Vector3())).multiplyScalar(0.5))
		modelBody.addShape(
			box,
			bbox.getCenter(new Vector3()))
	}
	world.addBody(modelBody)

	// position model from modelBody and update 
	modelBody.quaternion.setFromAxisAngle(new Vector3(1,-0.5,0),Math.PI)
	modelBody.position.y = 400
	model.position.copy(modelBody.position)
	model.quaternion.copy(modelBody.quaternion)
	
	scene.add(model);
	
	// adjust viewport
	const size = bbox.getSize( new THREE.Vector3() );
	const radius = Math.max( size.x, Math.max( size.y, size.z ) ) * 0.5;
	controls.target0.copy( bbox.getCenter( new THREE.Vector3() ) );
	controls.position0.set( 0.3, 0.4, 2 ).multiplyScalar( radius*3 ).add( controls.target0 );
	controls.reset();

}, (xhr) => {
	console.log(xhr.loaded);
})
// lets add in an animation loop
const stepLength = 0.1
const animate = function () {
	renderer.render(scene, camera)
	requestAnimationFrame(animate)
	
	stats.update()
	cannonDebugger.update()
	world.step(stepLength)
   	if(modelLoaded) {
		model.position.copy(modelBody.position)
		model.quaternion.copy(modelBody.quaternion)
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