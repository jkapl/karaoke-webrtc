const WebSocket = require('ws');
const wss = new WebSocket.Server({ 
  port: WEB_SOCKET_PORT,
  clientTracking: true
});

wss.on('connection', (ws) => {
  console.log(wss.clients.size)

  ws.on('message', (message) => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    })
  });


  // ws.on('message', (msg) => {
  //   let msgObj = JSON.parse(msg);
  //   switch (msgObj.side) {
  //     case 'caller':
  //       console.log(msgObj.sessDescription);
  //       wss.clients.forEach(client => {
  //         console.log(client)
  //       })
  //     // for each client in wss.clients
  //       // if client !== msg.origin
  //         // send caller sdp offer        
  //     case 'reply':
  //     // for each client in wss.clients
  //       // if client !== msg.origin
  //         // send recepient reply
  //   }
  // });

})

module.exports = wss;