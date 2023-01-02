import * as THREE from 'three'
import { toRadians, cross } from 'maths'

const FOV = 75
const ASPECT_RATIO = 2
const NEAR_PLANE = 0.1
const FAR_PLANE = 1000
const FRAME_RATE = 60

let front = new THREE.Vector3(0, 0, -1)
let right = new THREE.Vector3(1, 0, 0)
let up = new THREE.Vector3(0, 1, 0)

let camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_PLANE, FAR_PLANE)
camera.rotation.order = "YXZ"

let scene = new THREE.Scene()

let light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(-1, 2, 4)
scene.add(light)

let color = 0x44aa88
let material = new THREE.MeshPhongMaterial({color})

let boxWidth = 100;
let boxHeight = 0.1;
let boxDepth = 100;
let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)
let floor = new THREE.Mesh(geometry, material)
floor.position.set(0, -2, -50)
scene.add(floor)

let canvas = document.querySelector("canvas")
canvas.addEventListener("mousedown", onMouseDown)
canvas.addEventListener("mouseup", onMouseUp)
canvas.addEventListener("mousemove", onMouseMove)
window.addEventListener("keydown", onKeyDown)
window.addEventListener("keyup", onKeyUp)

let renderer = new THREE.WebGLRenderer({canvas, alpha:true})
renderer.render(scene, camera)
setInterval(render_loop, 1000/FRAME_RATE)

let keyMap = 
{
    w : false,
    s : false,
    a : false,
    d : false,
}

function render_loop()
{
    canvas.width = window.innerWidth 
    canvas.width = canvas.innerWidth 
    renderer.setSize(window.innerWidth - 15, window.innerHeight - 16, false)
    renderer.render(scene, camera)
    updateCameraPosition()
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
        let pitch = lastPos.y - cursorPos.y
        let yawRad = toRadians(yaw)            
        let pitchRad = toRadians(pitch)
        camera.rotation.y += yawRad
        camera.rotation.x += pitchRad
        camera.getWorldDirection(front)
        right = cross(front, up)
        lastPos = { x: cursorPos.x, y: cursorPos.y }
    }
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
        camera.position.x += front.x
        camera.position.y += front.y
        camera.position.z += front.z
    }
    if (keyMap.s)
    {
        camera.position.x -= front.x
        camera.position.y -= front.y
        camera.position.z -= front.z
    }
    if (keyMap.a)
    {
        camera.position.x -= right.x
        camera.position.y -= right.y
        camera.position.z -= right.z
    }
    if (keyMap.d)
    {
        camera.position.x += right.x
        camera.position.y += right.y
        camera.position.z += right.z
    }
}