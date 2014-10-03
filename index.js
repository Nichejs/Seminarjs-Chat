module.exports = function (seminarjs) {
	if (typeof (seminarjs) == 'undefined') {
		console.error('[ERROR] Seminarjs not detected');
		process.exit(-1);
	}

	try {

		seminarjs.app.use('/plugins/chat/', function (req, res, next) {
			if (req.method !== 'GET') {
				next();
				return;
			}
			res.sendFile(__dirname + "/public/" + req.path);
		});

		var Chat = require('./src/chat-server.js');
		Chat(seminarjs.io);

	} catch (e) {
		console.error(e.getMessage());
	}
};