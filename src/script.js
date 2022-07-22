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

const world = new CANNON.World()
const cannonDebugger = new CannonDebugger(scene,world)
world.quatNormalizeSkip = 0;
world.quatNormalizeFast = false;

var solver = new CANNON.GSSolver();

world.defaultContactMaterial.contactEquationStiffness = 1e9;
world.defaultContactMaterial.contactEquationRelaxation = 4;

solver.iterations = 7;
solver.tolerance = 0.1;
var split = true;
if(split)
	world.solver = new CANNON.SplitSolver(solver);
else
	world.solver = solver;

world.gravity.set(0,-20,0);
world.broadphase = new CANNON.NaiveBroadphase();

// Create a slippery material (friction coefficient = 0.0)
physicsMaterial = new CANNON.Material("slipperyMaterial");
var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
														physicsMaterial,
											);
// We must add the contact materials to the world
world.addContactMaterial(physicsContactMaterial);

const groundShape = new CANNON.Plane()
const groundBody = new CANNON.Body({mass: 0})
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
world.addBody(groundBody)

const groundGeometry = new THREE.PlaneGeometry(300,300,50,50)
groundGeometry.rotateX(-Math.PI/2)
// groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2))
const groundMaterial = new THREE.MeshLambertMaterial({color:0xdddddd})
const groundMesh = new THREE.Mesh(groundGeometry,groundMaterial)
scene.add(groundMesh)
// lets add some lighting
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, -1)
//scene.add(light)

let model = null
let modelBody = null
let modelLoaded = false

const getBottom = (m) => {
	const b = new THREE.Box3().setFromObject( m );
	const c = b.getCenter(new Vector3())
	const sz= b.getSize(new Vector3())
	const v = new Vector3(
		c.x,
		c.y - sz.y/2,
		c.z)
	return v
}

ldrawLoader.load(marioUrl.href, (grp) => {
	modelLoaded = true
	LDrawUtils.mergeObject(grp)
	model = new THREE.Group().copy(grp)
	//model.position.y = 200
	
	for(let part of model.children) {
		console.log(part);
		const bbox = new THREE.Box3().setFromObject(part)
		const bboxHelper = new THREE.Box3Helper(bbox,0xff6600)
		scene.add(bboxHelper)
	}

	const bbox = new THREE.Box3().setFromObject( model );
	const bboxHelper = new THREE.Box3Helper(bbox,0xffff00);
	scene.add(bboxHelper)
 	const box = new CANNON.Box(bbox.getSize(new Vector3()).multiplyScalar(0.5))
	modelBody = new CANNON.Body({
		mass: 2, // kg
		shape: box,
		position: bbox.getCenter(new Vector3()),
		//position: model.position,
		//quaternion: model.quaternion
	})
	world.addBody(modelBody)

	//model.position.copy(modelBody.position)
	//model.quaternion.copy(modelBody.quaternion)
	//model.position.y = -200
	//model.rotateX(Math.PI/2)
	//model.rotateY(Math.PI/2)
	scene.add(model);
	const n = getBottom(model)
	//model.position.set(n.x,-n.y,n.z)
	
	const size = bbox.getSize( new THREE.Vector3() );
	const radius = Math.max( size.x, Math.max( size.y, size.z ) ) * 0.5;
	
	const bboxCenter = bbox.getSize(bbox.getCenter(new THREE.Vector3()))

	
	controls.target0.copy( bbox.getCenter( new THREE.Vector3() ) );
	controls.position0.set( 0.3, 0.4, 2 ).multiplyScalar( radius*3 ).add( controls.target0 );
	controls.reset();

}, (xhr) => {
	console.log(xhr.loaded);
}, (err) => {
	console.log(err);
})
// lets add in an animation loop
const stepLength = 0.1
const animate = function () {
	renderer.render(scene, camera)
	requestAnimationFrame(animate)
	//camera.position.setZ(camera.position.z + 1)
	stats.update()
	cannonDebugger.update()
	//world.step(stepLength)
/*   	if(modelLoaded) {
		//model.rotation.y += 0.01
		model.position.copy(modelBody.position)
		model.quaternion.copy(modelBody.quaternion)
	} */
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