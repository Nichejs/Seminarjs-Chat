/**
 * Test the Chat plugin server
 */
var should = require('should'),
	io = require('socket.io/node_modules/socket.io-client');

var socketURL = 'http://localhost:5000';

var options = {
	transports: ['websocket'],
	'force new connection': true
};

var chatUser1 = 'Test User 1';
var chatUser2 = 'Test User 2';
var chatUser3 = 'Test User 3';

describe("Chat Server", function () {

	/* Test 1 - A Single User */
	it('Should broadcast new user once they connect', function (done) {
		var client = io.connect(socketURL, options);

		client.on('connect', function (data) {
			client.emit('add user', chatUser1);
		});

		client.on('login', function (loginData) {
			loginData.should.be.an.Object;
			loginData['numUsers'].should.equal(1);
			/* If this client doesn't disconnect it will interfere 
      with the next test */
			client.disconnect();
			done();
		});
	});

	/* Test 2 - Two Users */
	it('Should broadcast new user to all users', function (done) {
		var client1 = io.connect(socketURL, options);

		client1.on('connect', function (data) {
			client1.emit('add user', chatUser1);

			/* Since first client is connected, we connect
      the second client. */
			var client2 = io.connect(socketURL, options);

			client2.on('connect', function (data) {
				client2.emit('add user', chatUser2);
			});

			client2.on('login', function (loginData) {
				loginData.should.be.an.Object;
				loginData['numUsers'].should.equal(2);
				client2.disconnect();
			});

		});

		client1.on('user joined', function (joinData) {
			joinData['username'].should.equal(chatUser2);
			joinData['numUsers'].should.equal(2);
			client1.disconnect();
			done();
		});
	});

	/* Test 3 - User sends a message to chat room. */
	it('Should be able to broadcast messages', function (done) {
		var client1, client2, client3;
		var message = 'Hello World';
		var messages = 0;

		var checkMessage = function (client) {
			client.on('new message', function (msg) {
				message.should.equal(msg.message);
				client.disconnect();
				messages++;
				if (messages === 2) {
					done();
				};
			});
		};

		client1 = io.connect(socketURL, options);
		checkMessage(client1);

		client1.on('connect', function (data) {
			client1.emit('add user', chatUser1);
			client2 = io.connect(socketURL, options);
			checkMessage(client2);

			client2.on('connect', function (data) {
				client2.emit('add user', chatUser2);
				client3 = io.connect(socketURL, options);

				client3.on('connect', function (data) {
					client3.emit('add user', chatUser3);
					client3.emit("new message", message);
				});
			});
		});
	});
});