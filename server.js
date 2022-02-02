const ws = require("ws");
const net = require("net");

const socketServer = new net.Server();
socketServer.on('connection', sock => {
    let partial = '';
    sock.on('data', data => {
        partial += data.toString();
        let chunk = undefined;
        try {
            chunk = JSON.parse(partial)
        } catch (e) {
            if (partial.includes("}{")) {
                let [before, after] = partial.split("}{", 2);
                before = before + "}"
                after = "{" + after

                chunk = JSON.parse(before)
                partial = after
            }
        }

        if (chunk) {
            websocketConnectionPool.forEach(sock => {

            })
        }
    })
});

const socketServerPort = 10000
const websocketServerPort = 20000

// Keep track of existing connections
// Start the WebSocketServer first
const websocketConnectionPool = new Set()
const websocketServer = new ws.WebSocketServer({
    port: websocketServerPort
})
websocketServer.on('connect', sock => {
    websocketConnectionPool.add(sock)
    sock.on('close', () => {
        websocketConnectionPool.delete(sock)
    })
})
console.log("[ws] listening on", websocketServerPort)

socketServer.listen(socketServerPort, undefined, undefined, () => {
    console.log("[odas] listening on", socketServerPort);
});



