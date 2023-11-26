const express = require("express");
const app = express();
const path = require("path");
const http = require("http");

const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server);

// Serve static files from the same directory as index.js
app.use(express.static(path.join(__dirname, "")));

app.get("/", (req, res) => {
  return res.sendFile("index.html");
});

server.listen(3000, () => {
  console.log("port connected to 3000");
});
