import { toSceneObject } from '../common/Helpers.js'
import * as ACTIONTYPE from '../common/ActionType.js'

export class WebSocketClient
{
    token = 0
    hasReceivedToken = false
    webSocket = null

    constructor(url, webSocketCallbacks)
    {
        this.url = url
        this.webSocketCallbacks = webSocketCallbacks
    }

    startClient(onTokenReceive)
    {
        this.webSocket = new WebSocket(this.url)
        this.webSocket.onmessage = (e)=>
        {
            if (this.hasReceivedToken)
            {
                let sceneObject = JSON.parse(e.data)
                if (sceneObject.actionType == ACTIONTYPE.ACTION_ADD)  
                    this.webSocketCallbacks.onAdd(sceneObject)
                else if (sceneObject.actionType == ACTIONTYPE.ACTION_UPDATE)  
                    this.webSocketCallbacks.onUpdate(sceneObject)
                else if (sceneObject.actionType == ACTIONTYPE.ACTION_DELETE) 
                    this.webSocketCallbacks.onDelete(sceneObject)
            }
            else
            {
                this.token = parseInt(e.data)
                this.hasReceivedToken = true
                onTokenReceive(this.token)
            }
        }
    }

    notifyReady(color, position, rotation, dimension)
    {
        this.notifyServer(toSceneObject(this.token, color, position, rotation, dimension, ACTIONTYPE.ACTION_READY))
    }

    notifyUpdate(color, position, rotation, dimension)
    {
        this.notifyServer(toSceneObject(this.token, color, position, rotation, dimension, ACTIONTYPE.ACTION_UPDATE))
    }

    notifyServer(sceneObject)
    {
        this.webSocket.send(JSON.stringify(sceneObject))
    }
}

export class WebSocketCallbacks
{
    constructor(onAdd, onUpdate, onDelete)
    {
        this.onAdd = onAdd
        this.onUpdate = onUpdate
        this.onDelete = onDelete
    }
}