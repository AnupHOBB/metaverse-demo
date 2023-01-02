//ws://127.0.0.1:8080/

const PORT = 8080

const WebSocket = require('ws')
const wsServer = new WebSocket.Server({ port: 8080 })

let index = 0
let open = false

wsServer.on('connection', (wsClient) => {
    console.log("client request detected")

    /* wsClient.on("message", data => {
        console.log(`Client has sent us: ${data}`)
    }); */

    wsClient.on('close', () => { 
        open = false 
        console.log("shutting down websocket")
    })
    open = true
    update(wsClient)
})

function update(wsClient)
{
    wsClient.send(index)
    index++
    if (open)
        setTimeout(()=>update(wsClient), 1000)
}

console.log("websocket server running in port 8080")