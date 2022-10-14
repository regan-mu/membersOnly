const express = require("express");
const router = express.Router()
const membersController = require("../controllers/membersController");
const messagesController = require("../controllers/messagesController");

router.get("/", membersController.index);

//SIGNUP
router.get("/signup", membersController.signupGet);
router.post("/signup", membersController.signupPost);

//Login
router.get("/login", membersController.loginGet);
router.post("/login-hander", membersController.loginHandler);
// Logout
router.get("/logout", membersController.logout);

//Messages
router.get("/messages", messagesController.allMessages);

//Create Message
router.get("/message/create", messagesController.createMessageGet);
router.post("/message/create", messagesController.createMessagePost);

// Delete Message
router.get("/message/:id/delete", messagesController.deleteMessage);

// Join club
router.get("/member/join-club", membersController.joinGet);
router.post("/member/join-club", membersController.joinPost);

module.exports = router;