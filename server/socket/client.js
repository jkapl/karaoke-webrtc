const ws = new WebSocket(`wss://`);

ws.onerror = err => console.log(err);
ws.onclose = () => console.log("socket closed");

ws.onopen = () => {
  // ws.send("Connection established");

};

ws.onmessage = e => {
  // console.log(e.data)
}

export default ws;
