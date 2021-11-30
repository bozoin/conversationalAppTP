const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const RiveScript=require('rivescript');
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var bot = new RiveScript();

// Load a directory full of RiveScript documents (.rive files). This is for
// Node.JS only: it doesn't work on the web!
bot.loadDirectory("brain").then(loading_done).catch(loading_error);

  // RiveScript remembers user data by their username and can tell
  // multiple users apart.
  let username = "local-user";

// All file loading operations are asynchronous, so you need handlers
// to catch when they've finished. If you use loadDirectory (or loadFile
// with multiple file names), the success function is called only when ALL
// the files have finished loading.
function loading_done() {
  console.log("Bot has finished loading!");

  // Now the replies must be sorted!
  bot.sortReplies();

  // NOTE: the API has changed in v2.0.0 and returns a Promise now.
  bot.reply(username, "Hello, bot!").then(function(reply) {
    console.log("The bot says: " + reply);
    io.emit('chat message', reply);

  });
}

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    bot.reply(username, msg).then(function(reply) {
      console.log("The bot says: " + reply);
      io.emit('chat message', reply);
  
    });
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

// It's good to catch errors too!
function loading_error(error, filename, lineno) {
  console.log("Error when loading files: " + error);
}