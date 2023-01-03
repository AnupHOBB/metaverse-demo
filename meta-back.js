//ws://127.0.0.1:8080/
const PORT = 8080

const WebSocket = require('ws')
const wsServer = new WebSocket.Server({ port: PORT })

const ACTION_ADD = "add"
const ACTION_DELETE = "delete"
const ACTION_READY = "ready"
const ACTION_UPDATE = "update"

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

const Three = require('three')

let token = 0
let colors = [0xFFAA00, 0xA4238B, 0xA123ED]
let startColorIndex = 0
let startPosition = new Three.Vector3(0, -1.5, -5)
let defaultDimension = new Three.Vector3(1, 1, 1)

let clientMap = new Map()

let baseSceneObjects = new Array()
baseSceneObjects.push(new SceneObject(-1, 0x44aa88, new Three.Vector3(0, -2, -50), new Three.Vector3(0, 0, 0), new Three.Vector3(100, 0.1, 100), ACTION_ADD))

wsServer.on('connection', (wsClient) => 
{
    wsClient.id = token
    token++
    console.log("client request detected with id "+wsClient.id)
    wsClient.send(wsClient.id)
    
    wsClient.on("message", data => {
        console.log(`Client has sent us: ${data}`)
        let clientSceneObject = jsonToSceneObject(data) 
        if (clientSceneObject.actionType == ACTION_READY)
        {
            let newClientSceneObject = createNewSceneObject(wsClient.id)
            notifyClients(wsClient.id, newClientSceneObject)
            for (sceneObject of baseSceneObjects)
                notifyClient(wsClient, sceneObject)
            let clientSceneObjects = clientMap.values()
            for (clientSceneObject of clientSceneObjects)
                notifyClient(wsClient, clientSceneObject)
            notifyClient(wsClient, newClientSceneObject)
            updateScene(wsClient, newClientSceneObject)
            console.log("clientMap size :: "+clientMap.size)
        }
        else if (clientSceneObject.actionType == ACTION_UPDATE)
            notifyClients(wsClient.id, clientSceneObject)
    });

    wsClient.on('close', () => { 
        console.log("client with id :: "+wsClient.id+" disconnected")
        if (clientMap.size > 0)
        {
            let disClientSceneObject = clientMap.get(wsClient)
            disClientSceneObject.actionType = ACTION_DELETE
            clientMap.delete(wsClient)
            notifyClients(wsClient.id, disClientSceneObject)
            if (startColorIndex > 0)
                startColorIndex = 0
            startPosition.x -= 5    
            console.log("clientmap size :: "+clientMap.size)
        }
    })
    //wsClient.send(clients)
})

function updateScene(client, sceneObject)
{
    clientMap.set(client, sceneObject)
}

function notifyClients(clientId, sceneObject)
{
    let keys = clientMap.keys()
    for (key of keys)
        if (key.id != clientId)
            notifyClient(key, sceneObject)
}

function notifyClient(client, sceneObject)
{
    client.send(sceneObjectToJson(sceneObject))
}

function jsonToSceneObject(json)
{
    return JSON.parse(json)
}

function sceneObjectToJson(sceneObject)
{
    if (sceneObject == null || sceneObject == undefined)
        return ""
    return JSON.stringify(sceneObject)
}

function createNewSceneObject(token)
{
    let sceneObject = new SceneObject(token, colors[startColorIndex], new Three.Vector3(startPosition.x, startPosition.y, startPosition.z), new Three.Vector3(0, 0, 0), defaultDimension, ACTION_ADD)
    startPosition.x += 5
    startColorIndex++
    if (startColorIndex == colors.length)
        startColorIndex = 0
    return sceneObject
}

console.log("websocket server running in port 8080")