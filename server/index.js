const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const wss = require('./socket/server');




app.use(express.static(path.join(__dirname)));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))