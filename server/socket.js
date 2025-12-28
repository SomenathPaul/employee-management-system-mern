const { Server } = require("socket.io");
const Message = require("./models/Message");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("sendMessage", async (data) => {
      const saved = await Message.create(data);
      io.to(data.receiverId.toString()).emit("receiveMessage", saved);
    });
  });
};
