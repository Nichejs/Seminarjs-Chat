module.exports = function (App) {
	if (typeof (App) == 'undefined') {
		console.error('ERROR: Seminarjs not detected');
		process.exit(-1);
	}

	try {

		App.express.use('/plugins/chat/', function (req, res, next) {
			if (req.method !== 'GET') {
				next();
				return;
			}
			res.sendFile(__dirname + "/public/" + req.path);
		});

		var Chat = require('./src/chat-server.js');
		Chat(App.io);

	} catch (e) {
		console.error(e.getMessage());
	}
};