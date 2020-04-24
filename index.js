const express = require('express');
const WebSocket = require('ws');
const app = express();
const path = require('path');
const port = 3000;

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`received: ${message}`);
  });

  ws.send('something');
})

app.use(express.static(path.join(__dirname)));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))