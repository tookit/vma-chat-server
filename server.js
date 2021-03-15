
const superagent = require('superagent');
const http = require('http')
const server = http.createServer();
const io = require('socket.io')(server,{
  cors: {
    origin: "*",
  }
});
const  clients = new Set();
let users = [] // online users
const updateUsers = (user) => {
  const index = users.findIndex((item) => item.username === user.username)
  if (index === -1) {
    users.push(user)
  } else {
    users[index] = user
  }
}
//handle the socket
io.sockets.on('connection', (socket) =>  {
    console.log(socket.id + ': connected')
    clients.add(socket.id)
    socket.on('join', ( { username, status, clientId } ) => {
      console.log(username + ': joined')
      updateUsers({ username, status, clientId })
      io.local.emit('join', users)
    })
    socket.on('message', ( message ) => {
        console.log(socket.id + `send : ${message.text}`)
        socket.broadcast.emit('message', message);
    });
    socket.on('disconnect', () => {
      clients.delete(socket.id)
      users = users.filter(item => item.clientId !== socket.id)
      console.log(socket.id + ': disconnected')
      socket.broadcast.emit('leave', users);
  });    
});
server.listen(process.env.PORT || 3000);