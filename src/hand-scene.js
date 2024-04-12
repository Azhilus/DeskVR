import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { XR8 } from '8thwall-xr'

// Builds a scene object with a mesh, and manages state updates to each component.
const buildHand = (modelGeometry) => {
  const hand = new THREE.Object3D()
  hand.visible = false

  const rightIndices = new Array(3 * modelGeometry.rightIndices.length)
  for (let i = 0; i < modelGeometry.rightIndices.length; i++) {
    rightIndices[3 * i] = modelGeometry.rightIndices[i].a
    rightIndices[3 * i + 1] = modelGeometry.rightIndices[i].b
    rightIndices[3 * i + 2] = modelGeometry.rightIndices[i].c
  }

  // build hand mesh
  const geometry = new THREE.BufferGeometry()
  const meshVertices = new Float32Array(3 * modelGeometry.pointsPerDetection)
  geometry.setAttribute('position', new THREE.BufferAttribute(meshVertices, 3))
  geometry.setIndex(rightIndices)

  // Wireframe material
  const material = new THREE.MeshBasicMaterial({ color: 0x7611B6, opacity: 0, transparent: true, wireframe: true })
  const handMesh = new THREE.Mesh(geometry, material)
  hand.add(handMesh)

  // build hand occluder
  const occluderGeometry = new THREE.BufferGeometry()
  const occluderVertices = new Float32Array(3 * modelGeometry.pointsPerDetection)
  occluderGeometry.setAttribute('position', new THREE.BufferAttribute(occluderVertices, 3))
  occluderGeometry.setIndex(rightIndices)

  // Fill occluder with default normals.
  const occluderNormals = new Float32Array(modelGeometry.pointsPerDetection * 3)
  occluderGeometry.setAttribute('normal', new THREE.BufferAttribute(occluderNormals, 3))
  const occluderMaterial = new THREE.MeshBasicMaterial({ color: '#F5F5F5', transparent: false, colorWrite: false })
  const handOccluder = new THREE.Mesh(occluderGeometry, occluderMaterial)
  hand.add(handOccluder)

  // Show only the hand mesh
  handMesh.visible = true;

  // Update geometry on each frame with new info from the hand controller.
  const show = (event) => {
    const { transform, vertices, normals } = event.detail

    // Update the overall hand position.
    hand.position.copy(transform.position)
    hand.scale.set(transform.scale, transform.scale, transform.scale)

    // Update the hand mesh vertex positions.
    const { position } = handMesh.geometry.attributes
    for (let i = 0; i < vertices.length; i++) {
      position.setXYZ(i, vertices[i].x, vertices[i].y, vertices[i].z)
    }
    position.needsUpdate = true

    // Update the hand occluder vertex positions.
    const occluderPosition = handOccluder.geometry.attributes.position
    for (let i = 0; i < vertices.length; i++) {
      occluderPosition.setXYZ(i, vertices[i].x, vertices[i].y, vertices[i].z)
    }
    occluderPosition.needsUpdate = true

    // Update hand occluder normals.
    for (let i = 0; i < normals.length; ++i) {
      occluderNormals[i * 3] = normals[i].x
      occluderNormals[i * 3 + 1] = normals[i].y
      occluderNormals[i * 3 + 2] = normals[i].z
    }
    occluderNormals.needsUpdate = true

    // Update vertex positions along the normal to make occluder smaller and prevent z-fighting
    for (let i = 0; i < vertices.length; ++i) {
      const normal = normals[i]

      // Shift the position along the normal.
      const shiftAmount = 0.002  // Adjust this value as needed to make occluder larger/smaller
      occluderVertices[i * 3] += normal.x * shiftAmount
      occluderVertices[i * 3 + 1] += normal.y * shiftAmount
      occluderVertices[i * 3 + 2] += normal.z * shiftAmount
    }
    occluderPosition.needsUpdate = true

    // Show the hand mesh and occluder
    handMesh.frustumCulled = false
    handMesh.visible = true
    handOccluder.frustumCulled = false
    handOccluder.visible = true
    hand.visible = true
  }

  // Hide all objects.
  const hide = () => {
    hand.visible = false
    handMesh.visible = false
    handOccluder.visible = false
  }

  return {
    object3d: hand,
    show,
    hide,
  }
}

// Build a pipeline module that initializes and updates the three.js scene based on handcontroller
// events.
const handScenePipelineModule = () => {
  // Start loading mesh url early.
  let canvas_
  let modelGeometry_

  // track one hand
  let handMesh_ = null

  // init is called by onAttach and by handcontroller.handloading. It needs to be called by both
  // before we can start.
  const init = ({ canvas, detail }) => {
    canvas_ = canvas_ || canvas
    modelGeometry_ = modelGeometry_ || detail

    if (!(canvas_ && modelGeometry_)) {
      return
    }

    // Get the 3js scene from XR
    const { scene } = XR8.Threejs.xrScene()  // Get the 3js scene from XR8.Threejs

    // add hand mesh to the scene
    handMesh_ = buildHand(modelGeometry_)
    scene.add(handMesh_.object3d)

    // prevent scroll/pinch gestures on canvas.
    canvas_.addEventListener('touchmove', event => event.preventDefault())
  }

  const onDetach = () => {
    canvas_ = null
    modelGeometry_ = null
  }

  // Update the corresponding hand mesh
  const show = (event) => {
    handMesh_.show(event)
  }
  const hide = (event) => {
    handMesh_.hide()
  }

  return {
    name: 'handscene',
    onAttach: init,
    onDetach,
    listeners: [
      { event: 'handcontroller.handloading', process: init },
      { event: 'handcontroller.handfound', process: show },
      { event: 'handcontroller.handfound', process: show },
      { event: 'handcontroller.handupdated', process: show },
      { event: 'handcontroller.handlost', process: hide },
    ],
  }
}

export { handScenePipelineModule }
