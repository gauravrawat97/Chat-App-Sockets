const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//👇🏻 New imports
const http = require("http").Server(app);
const cors = require("cors");
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "<http://localhost:3000>",
  },
});

//👇🏻 Generates random string as the ID
const generateID = () => Math.random().toString(36).substring(2, 10);

let messages = [];

app.use(cors());

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("newMessage", (data) => {
    //👇🏻 Destructures the property from the object
    const { message, user, timestamp } = data;

    //👇🏻 Finds the room where the message was sent

    //👇🏻 Create the data structure for the message
    const newMessage = {
      id: generateID(),
      text: message,
      user,
      time: `${timestamp.hour}:${timestamp.mins}`,
    };
    //👇🏻 Updates the chatroom messages
    messages.push(newMessage);
    //Use to send global messages
    socketIO.of("/").emit("roomMessage", messages);
  });
  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});
app.get("/api", (req, res) => {
  res.json(messages);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
