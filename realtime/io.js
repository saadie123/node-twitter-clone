module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log("Connected");
    });
}