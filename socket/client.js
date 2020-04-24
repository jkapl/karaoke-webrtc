const ws = new WebSocket('ws://localhost:3000');

ws.onerror = err => console.log(err);
ws.onclose = () => console.log("socket closed");

ws.onopen = () => {
  ws.send("Connection established");
};

