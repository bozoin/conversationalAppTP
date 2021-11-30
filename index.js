const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const RiveScript=require('rivescript');
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var bot = new RiveScript();

bot.loadDirectory("brain").then(loading_done).catch(loading_error);
let username = "local-user";

function loading_done() {
  console.log("Bot has finished loading!");
  bot.sortReplies();
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

function loading_error(error, filename, lineno) {
  console.log("Error when loading files: " + error);
}