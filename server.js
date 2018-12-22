var uniqid = require('uniqid');
var express = require('express');
var app = express();

app.use(express.static(__dirname));

const server = app.listen(5002, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});