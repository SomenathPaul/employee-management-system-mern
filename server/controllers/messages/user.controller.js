const User = require("../../models/users");

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
