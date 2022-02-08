const ws = require('ws');
const net = require('net');
const fs = require('fs');

const socketServer = new net.Server();
socketServer.on('connection', sock => {
	console.log('Received connection from socket client');
	// Record data so it can be played back and this code can be tested
	// even when I don't have the Pi
	const recordedChunks = [];
	let partial = '';
	sock.on('data', data => {
		partial += data.toString();

		// Splits apart packets that arrived together
		// This regex finds positions that are preceded by a '}' and followed by a '{'
		let chunks = partial.split(/(?<=})\n?(?={)/);
		for (let chunk of chunks) {
			try {
				// Check if the chunk is valid JSON
				JSON.parse(chunk);

				// Broadcast the chunk
				recordedChunks.push({
					chunk: JSON.parse(chunk),
					timestamp: Date.now(),
				});
				websocketConnectionPool.forEach(sock => sock.send(chunk));

				// Clear the running partial chunk
				partial = '';
			} catch (e) {
				// Chunk is unparseable
				partial += chunk;
			}
		}
	});

	sock.on('close', () => {
		console.log('Socket client disconnected');
		// Write the recorded data to a file
		fs.writeFileSync(
			`recordings/recorded_chunks_${Date.now()}.json`,
			JSON.stringify(recordedChunks)
		);
	});
});

const socketServerPort = 10000;
const websocketServerPort = 20000;

// Keep track of existing connections
// Start the WebSocketServer first
const websocketConnectionPool = new Set();
const websocketServer = new ws.WebSocketServer({
	port: websocketServerPort,
});
websocketServer.on('connection', sock => {
	console.log('Received connection from WebSocket client');
	websocketConnectionPool.add(sock);
	sock.on('close', () => {
		websocketConnectionPool.delete(sock);
	});
});
console.log('[ws] listening on', websocketServerPort);

socketServer.listen(socketServerPort, undefined, undefined, () => {
	console.log('[odas] listening on', socketServerPort);
});
