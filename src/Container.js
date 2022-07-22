import { Material, ContactMaterial, Plane, Body } from 'cannon-es'

class Container {
    constructor(vec, world) {
        this.world = world
        this.vec = vec

        // Materials
        const stone = new Material('stone')
        const stone_stone = new ContactMaterial(stone, stone, {
            friction: 0.3,
            restitution: 0.2,
        })
        this.world.addContactMaterial(stone_stone)

        // Ground plane
        const groundShape = new Plane()
        const groundBody = new Body({ mass: 0, material: stone })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        this.world.addBody(groundBody)

        // Plane -x
        const planeShapeXmin = new Plane()
        const planeXmin = new Body({ mass: 0, material: stone })
        planeXmin.addShape(planeShapeXmin)
        planeXmin.quaternion.setFromEuler(0, Math.PI / 2, 0)
        planeXmin.position.set(-vec.x, 0, 0)
        this.world.addBody(planeXmin)

        // Plane +x
        const planeShapeXmax = new Plane()
        const planeXmax = new Body({ mass: 0, material: stone })
        planeXmax.addShape(planeShapeXmax)
        planeXmax.quaternion.setFromEuler(0, -Math.PI / 2, 0)
        planeXmax.position.set(vec.x, 0, 0)
        this.world.addBody(planeXmax)

        // Plane -z
        const planeShapeZmin = new Plane()
        const planeZmin = new Body({ mass: 0, material: stone })
        planeZmin.addShape(planeShapeZmin)
        planeZmin.quaternion.setFromEuler(0, 0, 0)
        planeZmin.position.set(0, 0, -vec.z)
        this.world.addBody(planeZmin)

        // Plane +z
        const planeShapeZmax = new Plane()
        const planeZmax = new Body({ mass: 0, material: stone })
        planeZmax.addShape(planeShapeZmax)
        planeZmax.quaternion.setFromEuler(0, Math.PI, 0)
        planeZmax.position.set(0, 0, vec.z)
        this.world.addBody(planeZmax)
    }
}
export default Container;