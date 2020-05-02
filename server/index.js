const express = require('express');
const app = express();
const path = require('path');
const port = NODE_APP_SERVICE_PORT;
const wss = require('./socket/server');




app.use(express.static(path.join(__dirname)));

app.listen(port, () => console.log(`Example app listening at ${NODE_APP_SERVICE_HOST}:${NODE_APP_SERVICE_PORT}`))