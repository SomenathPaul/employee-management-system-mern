const Message = require("../../models/Message");

exports.getMessages = async (req, res) => {
  const { u1, u2 } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: u1, receiverId: u2 },
      { senderId: u2, receiverId: u1 },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
};

exports.markAsRead = async (req, res) => {
  const { senderId, receiverId } = req.body;

  await Message.updateMany(
    { senderId, receiverId, isRead: false },
    { isRead: true }
  );

  res.sendStatus(200);
};
