Seminarjs-Chat
==============

Chat plugin for Seminarjs

###Instalation
Once you have an instance of Seminarjs running, install the chat as an extra npm module:

```
Seminarjs$ npm install seminarjs-chat --save 
```

Now head over to the `index.js` file in Seminarjs, and add the following to the end:

```javascript
var chat = require("Seminarjs-Chat");
chat(App);
```

Finally, on `public/index.html` add the following:

```html
<link href="/plugins/chat/css/chat-irc.css" rel="stylesheet" media="all">
<!-- Make sure the following JavaScript is added after Socket.io and jQuery -->
<script src="/plugins/chat/js/chat-client.js"></script>
<script type="text/javascript">
  var socket = io();
  Chat.init(socket);
</script>
```

Your HTML will need to have the necesary HTML elements for the Chat. These can be set in any order and layout, but you will need to overwrite some settings if you change things.
A sample HTML layout using Bootstrap 3:

```html
<div id="plugin_Chat">
  <div class="viewport-header row">
    <div class="col-md-7"><h2>Chat</h2><small class="typing"></small></div>
    <div class="col-md-5 text-right online"><div>online</div></div>                  
  </div>
  <div class="chat-window">
    <div class="viewport">
      <div class="viewport-content"></div>
    </div>

    <form class="row row-chat">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Type your message" />

            <span class="input-group-btn">
                <button type="submit" class="btn btn-primary">Send</button>
            </span>
        </div>
    </form>
  </div>
  <div class="login-window row">
    <form>
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Username" />

            <span class="input-group-btn">
                <button type="submit" class="btn btn-primary">Login</button>
            </span>
        </div>
    </form>
  </div>
</div>
```

The configuration options for the chat are:

```javascript
{
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
}
```

These are passed to the Chat initializer as a second parameter:

```javascript
<script type="text/javascript">
  var socket = io();
  Chat.init(socket, {
    smoothScrolling: false
  });
</script>
```

If you override the selectors, the content that normally goes in them will appear on the ones you specify. You can use this to display data in multiple places for instance, showing the list of online users in more than one place.

###License
Plugin released under the MIT license
