const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// server (emit) -> client (receive) --acknowledgement-->server
// client (emit) -> server (receive) - acknowledgement-->client

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }) => {
        socket.join(room)

        socket.emit('message', generateMessage('Welcome')) //clienta bir şey yollamaya çalışıyoruz
        // burada yaptığımız değişiklik diğer açtığımız yerlerde görünmüyordu
        socket.broadcast.to(room).emit('message', generateMessage(username + ' has joined!'))

        // socket.emit, io.emit -- her bağlantıda görünsün diye io kullandık, socket.broadcast.emit -- kendi dışında herkese yolluyor
        // io.to.emit -- emit everything in spesific room, socket.broadcast.to.emit -- sending an event to everyone except the specific client
    })

    socket.on('sendMessage', (message, callback) => { //clienttan bir şey almaya çalışıyoruz
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to('cullok').emit('message', generateMessage(message))
        callback() //mesaj başarıyla gitti mi kontrolü
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage('https://google.com/maps?q=' + coords.latitude + ',' + coords.longitude))
        callback()
    })

    socket.on('disconnect', () => { //disconnect olduğunu anlıyor
        io.emit('message', generateMessage('A user has left!'))
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port + '!')
})