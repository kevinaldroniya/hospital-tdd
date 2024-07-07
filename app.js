const express = require('express');
const app = express();

app.get('/',(res) => {
    res.send('Hello World Express!');
});

module.exports = app;