import * as THREE from 'three'
import { toRadians, cross, subtractVectors } from 'maths'

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

let scene = new THREE.Scene()

let light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(-1, 2, 4)
light.castShadow = true
light.shadow.mapSize.width = 512
light.shadow.mapSize.height = 512
light.shadow.camera.near = 0.5
light.shadow.camera.far = 500

scene.add(light)

if(ENABLE_LIGHT_GIZMOS)
{
    let helper = new THREE.CameraHelper(light.shadow.camera)
    scene.add(helper)
}

let canvas = document.querySelector("canvas")
canvas.addEventListener("mousedown", onMouseDown)
canvas.addEventListener("mouseup", onMouseUp)
canvas.addEventListener("mousemove", onMouseMove)
window.addEventListener("keydown", onKeyDown)
window.addEventListener("keyup", onKeyUp)

let renderer = new THREE.WebGLRenderer({canvas, alpha:true})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.render(scene, camera)
setInterval(render_loop, 1000/FRAME_RATE)

class SceneObject
{
    constructor(token, color, position, rotation, dimension, actionType)
    {
        this.token = token
        this.color = color
        this.position = position
        this.rotation = rotation
        this.dimension = dimension
        this.actionType = actionType
    }
}

function render_loop()
{
    canvas.width = window.innerWidth 
    canvas.width = canvas.innerWidth 
    renderer.setSize(window.innerWidth - 15, window.innerHeight - 16, false)
    renderer.render(scene, camera)
    updateCameraPosition()
    notifyServer()
}

let isMouseDown = false
let lastPos = { x: -1, y: -1 }

function onMouseDown(event)
{
    lastPos = { x: event.clientX, y: event.clientY }
    isMouseDown = true
}

function onMouseUp()
{
    lastPos = { x: -1, y: -1 }
    isMouseDown = false
}

function onMouseMove(event)
{
    if (isMouseDown)
    {
        let cursorPos = { x: event.clientX, y: event.clientY }
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
        lastPos = { x: cursorPos.x, y: cursorPos.y }
    }
}

let keyMap = 
{
    w : false,
    s : false,
    a : false,
    d : false,
}

function onKeyDown(event)
{
    if (event.key == 'w')
        keyMap.w = true
    if (event.key == 's')
        keyMap.s = true
    if (event.key == 'a')
        keyMap.a = true
    if (event.key == 'd')
        keyMap.d = true
}

function onKeyUp(event)
{
    if (event.key == 'w')
        keyMap.w = false
    if (event.key == 's')
        keyMap.s = false
    if (event.key == 'a')
        keyMap.a = false
    if (event.key == 'd')
        keyMap.d = false
}

function updateCameraPosition()
{
    if (keyMap.w)
    {
        player.position.x += front.x
        player.position.y += front.y
        player.position.z += front.z

        camera.position.x += front.x
        camera.position.y += front.y
        camera.position.z += front.z
    }
    if (keyMap.s)
    {
        player.position.x -= front.x
        player.position.y -= front.y
        player.position.z -= front.z

        camera.position.x -= front.x
        camera.position.y -= front.y
        camera.position.z -= front.z
    }
    if (keyMap.a)
    {
        player.position.x -= right.x
        player.position.y -= right.y
        player.position.z -= right.z

        camera.position.x -= right.x
        camera.position.y -= right.y
        camera.position.z -= right.z
    }
    if (keyMap.d)
    {
        player.position.x += right.x
        player.position.y += right.y
        player.position.z += right.z

        camera.position.x += right.x
        camera.position.y += right.y
        camera.position.z += right.z
    }
}

let sceneMap = new Map()

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
    if (sceneobject.token == myToken)
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

const ACTION_ADD = "add"
const ACTION_DELETE = "delete"
const ACTION_READY = "ready"
const ACTION_UPDATE = "update"
let myToken
let hasReceivedToken = false
let player
let webSocket
window.onload = () => {
    setTimeout(()=>{
        webSocket = new WebSocket("ws://localhost:8080")
        webSocket.onmessage = (e) => {
            if (hasReceivedToken)
            {
                let sceneObject = JSON.parse(e.data)
                if (sceneObject.actionType == ACTION_ADD)
                    addToWorld(sceneObject)
                else if (sceneObject.actionType == ACTION_DELETE)
                    removeFromWorld(sceneObject)
                else if (sceneObject.actionType == ACTION_UPDATE)
                {
                    let box = sceneMap.get(sceneObject.token)
                    box.position.x = sceneObject.position.x
                    box.position.y = sceneObject.position.y
                    box.position.z = sceneObject.position.z
                    box.rotation.x = sceneObject.rotation.x
                    box.rotation.y = sceneObject.rotation.y
                    box.rotation.z = sceneObject.rotation.z
                }
            }
            else
            {
                myToken = parseInt(e.data)
                console.log("myToken :: "+myToken)
                hasReceivedToken = true
                webSocket.send(JSON.stringify(new SceneObject(0, 0, 0, 0, 0, ACTION_READY)))
            }
        }
    }, 5000) 
}

function notifyServer()
{
    if (webSocket != null && webSocket != undefined && player != null && player != undefined)
        webSocket.send(JSON.stringify(new SceneObject(myToken, 0, player.position, {x: player.rotation.x, y: player.rotation.y, z: player.rotation.z}, 0, ACTION_UPDATE  )))
}