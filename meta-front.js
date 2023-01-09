import * as THREE from 'three'
import { toRadians, cross, subtractVectors, addVectors } from 'maths'
import { KeyEvent, MouseEvent } from 'events'
import { WebSocketClient, WebSocketCallbacks } from 'websocket'

const FOV = 75
const ASPECT_RATIO = 2
const NEAR_PLANE = 0.1
const FAR_PLANE = 1000
const FRAME_RATE = 60
const ENABLE_LIGHT_GIZMOS = false

let front = new THREE.Vector3(0, 0, -1)
let right = new THREE.Vector3(1, 0, 0)
let up = new THREE.Vector3(0, 1, 0)

let camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_PLANE, FAR_PLANE)
camera.rotation.order = "YXZ"

let light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(-1, 2, 4)
light.castShadow = true
light.shadow.mapSize.width = 512
light.shadow.mapSize.height = 512
light.shadow.camera.near = 0.5
light.shadow.camera.far = 500

let scene = new THREE.Scene()
scene.add(light)

if(ENABLE_LIGHT_GIZMOS)
{
    let helper = new THREE.CameraHelper(light.shadow.camera)
    scene.add(helper)
}

let mouseEvent = new MouseEvent(updateCameraRotation)
let keyEvent = new KeyEvent(updateCameraPosition)

let canvas = document.querySelector("canvas")
canvas.addEventListener("mousedown", (e)=>mouseEvent.onDown(e))
canvas.addEventListener("mouseup", (e)=>mouseEvent.onUp())
canvas.addEventListener("mousemove", (e)=>mouseEvent.onMove(e))
window.addEventListener("keydown", (e)=>keyEvent.onDown(e))
window.addEventListener("keyup", (e)=>keyEvent.onUp(e))

let renderer = new THREE.WebGLRenderer({canvas, alpha:true})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.render(scene, camera)
setInterval(render_loop, 1000/FRAME_RATE)

let colors = [0xFFAA00, 0xA4238B, 0xA123ED]
let startPosition = new THREE.Vector3(0, -1.5, -5)
let startRotation = new THREE.Vector3(0, 0, 0)
let defaultDimension = new THREE.Vector3(1, 1, 1)
let player
let playerColor
let wsCallbacks = new WebSocketCallbacks(onResponse, onResponse, removeFromWorld)

let wsClient = new WebSocketClient("ws://localhost:8080", wsCallbacks)
wsClient.startClient(onTokenReceive)

let sceneMap = new Map()

function render_loop()
{
    canvas.width = window.innerWidth 
    canvas.width = canvas.innerWidth 
    renderer.setSize(window.innerWidth - 15, window.innerHeight - 16, false)
    renderer.render(scene, camera)
    keyEvent.notifyEvent()
}

function updateCameraRotation(lastPos, cursorPos)
{
    let yaw = lastPos.x - cursorPos.x
    let yawRad = toRadians(yaw)            
    player.rotation.y += yawRad
    let playerToCamVector = subtractVectors(camera.position, player.position)
    let ogplayerToCamVector = new THREE.Vector3(playerToCamVector.x, playerToCamVector.y, playerToCamVector.z)
    playerToCamVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRad)
    let displacement = subtractVectors(playerToCamVector, ogplayerToCamVector)
    camera.position.x += displacement.x
    camera.position.y += displacement.y
    camera.position.z += displacement.z
    camera.rotation.y += yawRad
    camera.getWorldDirection(front)
    right = cross(front, up)
    wsClient.notifyUpdate(playerColor, player.position, {x: player.rotation.x, y: player.rotation.y, z: player.rotation.z}, 0)
}

function updateCameraPosition(pressedW, pressedS, pressedA, pressedD)
{
    if (pressedW)
        incrementPosition(front)
    if (pressedS)
        decrementPosition(front)
    if (pressedA)
        decrementPosition(right)
    if (pressedD)
        incrementPosition(right)
    if (pressedW || pressedS || pressedA || pressedD)
        wsClient.notifyUpdate(playerColor, player.position, {x: player.rotation.x, y: player.rotation.y, z: player.rotation.z}, 0)
}

function incrementPosition(diffVector)
{
    let playerPosition = addVectors(player.position, diffVector)
    player.position.set(playerPosition.x, playerPosition.y, playerPosition.z)
    let cameraPosition = addVectors(camera.position, diffVector)
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
}

function decrementPosition(diffVector)
{
    let playerPosition = subtractVectors(player.position, diffVector)
    player.position.set(playerPosition.x, playerPosition.y, playerPosition.z)
    let cameraPosition = subtractVectors(camera.position, diffVector)
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
}

function addToWorld(sceneobject)
{
    let material = new THREE.MeshPhongMaterial({color: sceneobject.color})
    let geometry = new THREE.BoxGeometry(sceneobject.dimension.x, sceneobject.dimension.y, sceneobject.dimension.z)
    let box = new THREE.Mesh(geometry, material)
    box.position.set(sceneobject.position.x, sceneobject.position.y, sceneobject.position.z)
    box.rotation
    box.receiveShadow = true
    box.castShadow = true
    scene.add(box)
    if (sceneobject.token >= 0)
        sceneMap.set(sceneobject.token, box)
    if (sceneobject.token == wsClient.token)
    {   
        player = box
        camera.position.x = box.position.x
    }
}

function removeFromWorld(sceneobject)
{
    let box = sceneMap.get(sceneobject.token)
    scene.remove(box)
    sceneMap.delete(sceneobject.token)
}

function onTokenReceive(token)
{
    let colorIndex = token - (parseInt(token/colors.length) * colors.length)
    playerColor = colors[colorIndex]
    wsClient.notifyReady(playerColor, startPosition, startRotation, defaultDimension)
}

function onResponse(sceneObject)
{
    let box = sceneMap.get(sceneObject.token)
    if (box != undefined)
    {
        box.position.x = sceneObject.position.x
        box.position.y = sceneObject.position.y
        box.position.z = sceneObject.position.z
        box.rotation.x = sceneObject.rotation.x
        box.rotation.y = sceneObject.rotation.y
        box.rotation.z = sceneObject.rotation.z
    }
    else
        addToWorld(sceneObject)
}