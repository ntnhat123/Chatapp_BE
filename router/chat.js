import express from "express";
import {
  accessChat,
  addMember,
  createGroupChat,
  listChatOfUser,
  removeMember,
  reNameGroup,
  getUser,
  getChat,
  deleteGroup,
  searchAddMembers,
} from "../controller/chat.js";
import { auth } from "../middleware/protect.js";
const router = express.Router();
router.post("/create", auth, createGroupChat);
router.put("/rename", auth, reNameGroup);
router.put("/add", auth, addMember);
router.put("/remove", auth, removeMember);
router.delete("/delete/:id", auth, deleteGroup);
// export const searchUserGroup = (data, id) =>
//   API.get(`/chat/get!Group?fullName=${data}&chatId=${id}`, data, id);
router.get("/get!Group", auth, searchAddMembers);
// router.post("/", auth, accessChat);
router.post("/", accessChat);
router.get("/getChat/:id", auth, getChat);
router.get("/", auth, listChatOfUser);
router.get("/user", auth, getUser);
export default router;
