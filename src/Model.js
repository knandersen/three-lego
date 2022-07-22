import { LDrawUtils } from 'three/examples/jsm/utils/LDrawUtils'
import { Box3, Vector3 } from 'three'
import { Body, Box } from 'cannon-es'

class Model {
	constructor(url, options, position) {
		this.url = url
		this.world = options.world
		this.scene = options.scene
        this.loader = options.loader
		this.model = null
		this.modelBody = null
		this.loaded = false

		this.load(position)
	}

	load(p) {
		this.loader.load(this.url, (grp) => {
			this.loaded = true
			LDrawUtils.mergeObject(grp)
			this.model = grp
			this.modelBody = new Body({mass: 2})
			
			for(let part of this.model.children) {
				const bbox = new Box3().setFromObject(part)
				const box = new Box(bbox.getSize(bbox.getCenter(new Vector3())).multiplyScalar(0.5))
				this.modelBody.addShape(
					box,
					bbox.getCenter(new Vector3()))
			}
			this.world.addBody(this.modelBody)
		
			// position model from modelBody and update
            this.modelBody.position.set(p.x,p.y,p.z) 
			this.modelBody.quaternion.setFromAxisAngle(new Vector3(-1,0,0),Math.PI)
			this.model.position.copy(this.modelBody.position)
			this.model.quaternion.copy(this.modelBody.quaternion)
			
			this.scene.add(this.model);
		}, (xhr) => {
			console.log(xhr.loaded);
		})
	}

	update() {
		if(this.loaded) {
			this.model.position.copy(this.modelBody.position)
			this.model.quaternion.copy(this.modelBody.quaternion)
		}
	}
}
export default Model;