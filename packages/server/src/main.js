import API from './v2/api.js';

const Api = new API();

Api.listen();

console.log('WebSocket server started on port 8080');

setInterval(Api.processActionQueue, 100); // Process queue every 100ms