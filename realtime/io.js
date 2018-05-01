module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log("User Connected");

        socket.on('tweet', (data)=>{
            io.emit('message', {tweet:data, user: socket.request.user});
        });
    });
}