import * as ACTIONTYPE from "../common/ActionType.js"

let token = 0
let clientMap = new Map()

export function onClientConnect(client)
{
    client.id = token
    token++
    client.send(client.id)
}

export function onReceiveMessage(client, data)
{
    let clientSceneObject = JSON.parse(data) 
    if (clientSceneObject.actionType == ACTIONTYPE.ACTION_READY)
    {
        clientSceneObject.position.x += (clientSceneObject.token * 5)
        clientSceneObject.actionType = ACTIONTYPE.ACTION_ADD
        provideSceneInfo(client, clientSceneObject)
        clientMap.set(client, clientSceneObject)
        notifyOtherClients(client.id, clientSceneObject)
    }
    else if (clientSceneObject.actionType == ACTIONTYPE.ACTION_UPDATE)
    {
        clientMap.set(client, clientSceneObject)
        notifyOtherClients(client.id, clientSceneObject)
    }
}

export function onClientDisconnect(client)
{
    if (clientMap.size > 0)
    {
        let disClientSceneObject = clientMap.get(client)
        disClientSceneObject.actionType = ACTIONTYPE.ACTION_DELETE
        clientMap.delete(client)
        notifyOtherClients(client.id, disClientSceneObject)
    }
}

function notifyOtherClients(clientId, sceneObject)
{
    let clients = clientMap.keys()
    for (let client of clients)
        if (client.id != clientId)
            notifyClient(client, sceneObject)
}

function provideSceneInfo(client, newSceneObject)
{
    let clientSceneObjects = clientMap.values()
    for (let clientSceneObject of clientSceneObjects)
        notifyClient(client, clientSceneObject)
    notifyClient(client, newSceneObject)
}

function notifyClient(client, sceneObject)
{
    client.send(JSON.stringify(sceneObject))
}