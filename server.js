const express = require("express");
const app = express();
const path = require("path");
// create server
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("index.html");
});

server.listen(3000, () => {
  console.log("app is runing");
});

io.on("connection", (socket) => {
  socket.on("stream", (image) => {
    socket.broadcast.emit("streamFromServer", image);
  });
});
