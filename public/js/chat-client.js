/**
 * Seminarjs Chat plugin Client
 * The HTML elements can be set from the init function to customize the appearance. That can be used for example to
 * display the number of users online in other locations as well.
 * @param  {Object} $ jQuery reference
 * @return {Object}   Chat client object reference
 */
var Chat = (function ($) {
	var FADE_TIME = 150; // ms
	var TYPING_TIMER_LENGTH = 600; // ms
	var COLORS = [
	'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];

	var chat = {};

	var settings = {
		$window: $(window),
		$usernameInput: $('#plugin_Chat .login-window input'),
		$loginForm: $('#plugin_Chat .login-window form'),
		$chatForm: $('#plugin_Chat .chat-window form'),
		$online: $('#plugin_Chat .viewport-header .online div'),
		$messages: $('#plugin_Chat .viewport-content'),
		$inputMessage: $('#plugin_Chat .chat-window input'),
		$loginPage: $('#plugin_Chat .login-window'),
		$chatPage: $('#plugin_Chat .chat-window'),
		smoothScrolling: 400
	};

	/**
	 * Start the Chat client
	 * @param  {Object} io      Socket.io client
	 * @param  {Object} options Array of options
	 * @return {void}
	 */
	chat.init = function (io, options) {

		console.info("Initialized Seminarjs Chat client");

		settings = $.extend(settings, options);

		// Prompt for setting a username
		var username;
		var connected = false;
		var typing = false;
		var lastTypingTime;
		var $currentInput = settings.$usernameInput.focus();

		settings.$loginPage.show();
		settings.$chatPage.hide();

		/**
		 * Update the online count
		 * @param {Object} data Socket data frame, must have a numUsers attribute.
		 */
		function addParticipantsMessage(data) {
			var message = '';
			settings.$online.text(data.numUsers + " online");
		}

		/**
		 * Login the chat system
		 */
		function setUsername() {
			username = cleanInput(settings.$usernameInput.val().trim());

			// If the username is valid
			if (username) {
				settings.$loginPage.fadeOut();
				settings.$chatPage.show();
				settings.$loginPage.off('click');
				settings.$currentInput = settings.$inputMessage.focus();

				// Tell the server your username
				socket.emit('add user', username);
			}
		}

		/**
		 * Send a message to the client
		 * @return {void}
		 */
		function sendMessage() {
			var message = settings.$inputMessage.val();
			// Prevent markup from being injected into the message
			message = cleanInput(message);
			// if there is a non-empty message and a socket connection
			if (message && connected) {
				settings.$inputMessage.val('');
				addChatMessage({
					username: username,
					message: message
				});
				// tell server to execute 'new message' and send along one parameter
				socket.emit('new message', message);
			}
		}

		/**
		 * Display a server log message
		 * @param  {String} message Log message
		 * @param  {Array}	options Message options, see addMessageElement
		 * @return {void}
		 */
		function log(message, options) {
			var $el = $('<div class="bubble log"/>').text(message);
			addMessageElement($('<div class="bubble-container" />').append($el), options);
		}

		/**
		 * Add the HTML for a Chat message
		 * @param {Object} data    Message data, must contain the attributes username and message
		 * @param {Object} options Message options, see addMessageElement
		 */
		function addChatMessage(data, options) {
			// Don't fade the message in if there is an 'X was typing'
			var $typingMessages = getTypingMessages(data);
			options = options || {};
			if ($typingMessages.length !== 0) {
				options.fade = false;
				$typingMessages.remove();
			}

			var side = 'left';
			if (data.username == username) side = 'right';

			var $usernameDiv = $('<div class="avatar avatar-' + side + '"/>')
				.text(data.username)
				.css('color', getUsernameColor(data.username));
			var $messageBodyDiv = $('<div class="bubble bubble-' + side + '">')
				.text(data.message);

			var typingClass = data.typing ? 'typing' : '';
			var $messageDiv = $('<div class="bubble-container"/>')
				.data('username', data.username)
				.addClass(typingClass)
				.append($usernameDiv, $messageBodyDiv);

			addMessageElement($messageDiv, options);
		}

		/**
		 * Add the typing HTML to the message list
		 * @param {Object} data Message data, must contain the username attribute
		 */
		function addChatTyping(data) {
			data.typing = true;
			data.message = 'Escribiendo...';
			addChatMessage(data);
		}

		/**
		 * Remove the typing HTML indicator
		 * @param  {Object} data Message data, must contain the username attribute.
		 * @return {void}
		 */
		function removeChatTyping(data) {
			getTypingMessages(data).fadeOut(function () {
				$(this).remove();
			});
		}

		/**
		 * Adds the HTML element for a message and scrolls the chat
		 * to the bottom.
		 * @param {Object} el      HTML object to be added
		 * @param {Object} options Customization options. fade: boolean, whether the element should fade in. prepend: boolean, whether the message should prepend all others.
		 */
		function addMessageElement(el, options) {
			var $el = $(el);

			// Setup default options
			if (!options) {
				options = {};
			}
			if (typeof options.fade === 'undefined') {
				options.fade = true;
			}
			if (typeof options.prepend === 'undefined') {
				options.prepend = false;
			}

			// Apply options
			if (options.fade) {
				$el.hide().fadeIn(FADE_TIME);
			}
			if (options.prepend) {
				settings.$messages.prepend($el);
			} else {
				settings.$messages.append($el);
			}

			if (settings.smoothScrolling > 0) {
				settings.$messages.animate({
					scrollTop: settings.$messages[0].scrollHeight
				}, settings.smoothScrolling);
			} else {
				settings.$messages[0].scrollTop = settings.$messages[0].scrollHeight;
			}
		}

		/**
		 * Prevent code injection
		 * @param  {String} input Input to be cleaned
		 * @return {String}       Clean input
		 */
		function cleanInput(input) {
			return $('<div/>').text(input).text();
		}

		/**
		 * Updates the typing event according to a timer
		 * @return {void}
		 */
		function updateTyping() {
			if (connected) {
				if (!typing) {
					typing = true;
					socket.emit('typing');
				}
				lastTypingTime = (new Date()).getTime();

				setTimeout(function () {
					var typingTimer = (new Date()).getTime();
					var timeDiff = typingTimer - lastTypingTime;
					if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
						socket.emit('stop typing');
						typing = false;
					}
				}, TYPING_TIMER_LENGTH);
			}
		}

		/**
		 * Get the `user` is typing HTML element for a given user
		 * @param  {Object} data Message data, must contain a username attribute.
		 * @return {DOMObject}   HTML element
		 */
		function getTypingMessages(data) {
			return $('.typing').filter(function (i) {
				return $(this).data('username') === data.username;
			});
		}

		/**
		 * Generate a unique color for a username based on its hash
		 * @param  {String} username User name
		 * @return {String}          HTML color
		 */
		function getUsernameColor(username) {
			// Compute hash code
			var hash = 7;
			for (var i = 0; i < username.length; i++) {
				hash = username.charCodeAt(i) + (hash << 5) - hash;
			}
			// Calculate color
			var index = Math.abs(hash % COLORS.length);
			return COLORS[index];
		}

		// --------------------------------------------- //
		// 				   Event handlers                //
		// --------------------------------------------- //

		settings.$loginForm.on('submit', function (e) {
			e.preventDefault();
			setUsername();
		});

		settings.$chatForm.on('submit', function (e) {
			e.preventDefault();
			sendMessage();
			socket.emit('stop typing');
			typing = false;
		});

		settings.$inputMessage.on('input', function () {
			updateTyping();
		});

		// Click events

		// Focus input when clicking anywhere on login page
		settings.$loginPage.click(function () {
			$currentInput.focus();
		});

		// Focus input when clicking on the message input's border
		settings.$inputMessage.click(function () {
			settings.$inputMessage.focus();
		});

		// Socket events

		// Whenever the server emits 'login', log the login message
		socket.on('login', function (data) {
			connected = true;
			addParticipantsMessage(data);
		});

		// Whenever the server emits 'new message', update the chat body
		socket.on('new message', function (data) {
			addChatMessage(data);
		});

		// Whenever the server emits 'user joined', log it in the chat body
		socket.on('user joined', function (data) {
			log(data.username + ' se ha unido');
			addParticipantsMessage(data);
		});

		// Whenever the server emits 'user left', log it in the chat body
		socket.on('user left', function (data) {
			log(data.username + ' se ha desconectado');
			addParticipantsMessage(data);
			removeChatTyping(data);
		});

		// Whenever the server emits 'typing', show the typing message
		socket.on('typing', function (data) {
			addChatTyping(data);
		});

		// Whenever the server emits 'stop typing', kill the typing message
		socket.on('stop typing', function (data) {
			removeChatTyping(data);
		});

	}

	return chat;

}(jQuery));