import Message from "../model/message.js";
import Chat from "../model/chat.js";
import User from "../model/auth.js";
export const sendMessage = async (req, res) => {
  const { idChat, content, nameUser } = req.body;
  // console.log("image", image);
  try {
    const message = new Message({
      chat: idChat,
      content,
      users: req.userId,
      nameUser,
      // image,
    });
    await message.save();
    await Chat.findByIdAndUpdate(
      idChat,
      {
        latestMessage: message,
      },
      { new: true }
    );

    const newMessage = await Message.findOne({
      _id: message._id,
    }).populate("users", "-password");
    // .populate("chat");
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await Message.find({ chat: id }).populate(
      "users",
      "-password"
    );
    res.status(200).json(messages);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
