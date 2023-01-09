//ws://127.0.0.1:8080/
import {WebSocketServer}  from "ws"
import * as THREE from "three"
import * as ACTIONTYPE from "./common/ActionType.js"
import * as CORE from "./back/ServerCore.js"
import {toSceneObject} from "./common/Helpers.js"

const port = 8080
const wsServer = new WebSocketServer({ port: port })
const baseSceneObjects = [toSceneObject(-1, 0x44aa88, new THREE.Vector3(0, -2, -50), new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0.1, 100), ACTIONTYPE.ACTION_ADD)]

wsServer.on('connection', (wsClient) => 
{
    CORE.onClientConnect(wsClient)
    for (let sceneObject of baseSceneObjects)
        wsClient.send(JSON.stringify(sceneObject))
    wsClient.on("message", data => { CORE.onReceiveMessage(wsClient, data) });
    wsClient.on('close', () => { CORE.onClientDisconnect(wsClient) })
})

console.log("websocket server running in port 8080")
