if (typeof (App) == 'undefined') {
	console.error('ERROR: Seminarjs not detected');
	process.exit(-1);
}

App.express.use('/plugins/chat/', function (req, res) {
	if (req.method !== 'get') {
		next();
		return;
	}
	res.sendFile("./public/" + req.path);
});

var Chat = require('./src/chat-server.js');
Chat(App.io);