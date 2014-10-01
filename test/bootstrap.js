/**
 * Seminarjs Server code
 */
var express = require('express');;
var fs = require('fs');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000))

var App = {
	express: app,
	io: io
};

// Plugins
var chat = require("../index.js");
chat(App);

server.listen(app.get('port'), function () {
	console.log('Node server is running at localhost:' + app.get('port'))
});