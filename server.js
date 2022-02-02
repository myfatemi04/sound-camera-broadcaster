const ws = require("ws");
const net = require("net");

const socketServer = new net.Server();
socketServer.on('connection', sock => {
    let partial = '';
    sock.on('data', data => {
        partial += data.toString();

        // Splits apart packets that arrived together
        // This regex finds positions that are preceded by a '}' and followed by a '{'
        let chunks = partial.split(/(?<=})(?={)/);
        for (let chunk of chunks) {
            try {
                // Check if the chunk is valid JSON
                JSON.parse(chunk);

                // Broadcast the chunk
                websocketConnectionPool.forEach(sock => sock.send(chunk));

                // Clear the running partial chunk
                partial = '';
            } catch (e) {
                // Chunk is unparseable
                partial += chunk
            }
        }
    })
});

const socketServerPort = 10000;
const websocketServerPort = 20000;

// Keep track of existing connections
// Start the WebSocketServer first
const websocketConnectionPool = new Set()
const websocketServer = new ws.WebSocketServer({
    port: websocketServerPort
})
websocketServer.on('connection', sock => {
    websocketConnectionPool.add(sock);
    sock.on('close', () => {
        websocketConnectionPool.delete(sock);
    });
})
console.log("[ws] listening on", websocketServerPort);

socketServer.listen(socketServerPort, undefined, undefined, () => {
    console.log("[odas] listening on", socketServerPort);
});



