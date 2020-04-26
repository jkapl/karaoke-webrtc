const ws = new WebSocket('wss://b05786be.ngrok.io');

ws.onerror = err => console.log(err);
ws.onclose = () => console.log("socket closed");

ws.onopen = () => {
  // ws.send("Connection established");

};

ws.onmessage = e => {
  // console.log(e.data)
}

export default ws;
