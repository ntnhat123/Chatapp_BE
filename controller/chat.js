import Chat from "../model/chat.js";
import User from "../model/auth.js";
export const accessChat = async (req, res) => {
  const { ida, idb, chatName } = req.body;
  const check = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: ida } } },
      { users: { $elemMatch: { $eq: idb } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password");

  if (check.length > 0) {
    res.status(200).json(check[0]);
  } else {
    try {
      const newChat = new Chat({
        users: [ida, idb],
        // chatName: "chatName",
        isGroupChat: false,
      });
      await newChat.save();
      const updateChat = await Chat.findOne({
        _id: newChat._id,
      })
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password");
      res.status(200).json(updateChat);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const listChatOfUser = async (req, res) => {
  try {
    const chat = await Chat.find({
      users: { $elemMatch: { $eq: req.userId } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getChat = async (req, res) => {
  // const data = req.body;
  // console.log(data);
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.find({
      _id: { $ne: req.userId },
      fullName: { $regex: req.query.fullName, $options: "i" },
    });
    // if (user.isAppear === true) {
    //   res.status(200).json(user);
    // }
    // const check = user.filter((item) => item.isAppear === false);
    // res.status(200).json(check);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
export const createGroupChat = async (req, res) => {
  try {
    const { id, image, chatName } = req.body;

    if (id.length < 2) {
      return res
        .status(400)
        .json({ message: "Please select at least 2 users" });
    }

    id.push(req.userId);
    const newChat = await Chat.create({
      users: id,
      // chatName: req.body.chatName,
      image,
      chatName,
      isGroupChat: true,
      groupAdmin: req.userId,
    });
    //   .populate("users", "-password")
    //   .populate("latestMessage");
    const updateChat = await Chat.findOne({
      _id: newChat._id,
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");
    res.status(200).json(updateChat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reNameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      {
        _id: chatId,
      },
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchAddMembers = async (req, res) => {
  const { fullName, chatId } = req.query;
  try {
    const chat = await Chat.findOne({
      _id: chatId,
    });
    const a = JSON.stringify(chat.users);
    const b = JSON.parse(a);
    const user = await User.find({
      _id: { $nin: b },
      fullName: { $regex: fullName, $options: "i" },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      {
        _id: chatId,
      },
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { chatId } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      { _id: chatId },
      { $pull: { users: req.userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  const { id: chatId } = req.params;
  try {
    const check = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password");

    if (check.groupAdmin._id.toString() === req.userId) {
      const chat = await Chat.findByIdAndDelete(chatId)
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password");
      res.status(200).json(chat);
    } else {
      res.status(500).json({ message: "You are not the room owner " });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
