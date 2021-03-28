
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
let users = [] // online users {username: '', ip: ''}
function updateUsers(user) {
  const find = users.find((item) => item.username === user.username)
  if (find === undefined) {
    users.push(user)
  }
}

function bindUser(username, clientId) {
  users.forEach((item) =>　{
    if(item.clientId === clientId) {
      item.username  =username
      return item
    }
  })
  return false
}

//handle the socket
io.sockets.on('connection', (socket) =>  {

    clients.add(socket.id)
    socket.join(ROOM)
    socket.on('join', ( user ) => {
      const { address, headers } = socket.handshake
      const agent = headers['user-agent']
      const item = { ip: address, clientId: socket.id, agent: agent, username:user.username }  
      updateUsers(item)    
      console.log( user.username + ': joined.')
      io.local.emit('join', item)
    })
    socket.on('message', ( message ) => {
        console.log(message.username + ` send : ${message.text} ${message.createdAt}`)
        socket.broadcast.emit('message', message)
    })
    socket.on('disconnect', () => {
      const user = users.find(item => item.clientId === socket.id)
      users = users.filter(item => item.clientId !== socket.id)
      if(user) {
        socket.broadcast.emit('leave', user)
      }
  })    
})
server.listen(process.env.PORT || 3000)