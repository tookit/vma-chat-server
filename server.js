
const superagent = require('superagent')
const http = require('http')
const ROOM = 'VMA'
const server = http.createServer()
const io = require('socket.io')(server,{
  cors: {
    origin: "*",
  }
})
const  clients = new Set()
let users = [] // online users
const updateUsers = (user) => {
  const find = users.find((item) => item.clientId === user.clientId)
  if (find === undefined) {
    users.push(user)
  }
}
//handle the socket
io.sockets.on('connection', (socket) =>  {
    const { address, headers } = socket.handshake
    const agent = headers['user-agent']
    const user = { ip: address, clientId: socket.id, agent: agent,username:socket.id, status: 1 }
    updateUsers(user)
    console.log(`${socket.id} is using ${agent}  connected from ${address}` )
    clients.add(socket.id)
    socket.join(ROOM)
    socket.on('join', ( { username, status, clientId } ) => {
      io.local.emit('join', users)
    })
    socket.on('message', ( message ) => {
        console.log(socket.id + `send : ${message.text} ${message.createdAt}`)
        socket.broadcast.emit('message', message)
    })
    socket.on('disconnect', () => {
      clients.delete(socket.id)
      users = users.filter(item => item.clientId !== socket.id)
      console.log(socket.id + ': disconnected')
      socket.broadcast.emit('leave', socket.id)
  })    
})
server.listen(process.env.PORT || 3000)