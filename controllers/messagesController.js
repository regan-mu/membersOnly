const Message = require("../models/Message");
const gravatar = require('gravatar');
const {body, validationResult} = require("express-validator");

exports.allMessages = (req, res, next) => {
    const secureUrl = gravatar.url('membersonlyp@gmail.com', {s: '100', r: 'x', d: "retro"}, true);
    if (req.user) {
        Message.find().sort({datePosted: -1}).populate("postedBy").exec((err, messages) => {
            if(err) {
                next(err);
            }
            res.render("messages", {
                title: "Messages",
                messages: messages,
                gravatar: secureUrl
            });
        });
    } else {
        res.redirect("/anonymous/login");
    }
}


exports.createMessageGet = (req, res) => {
    if (req.user) {
        res.render("createMsg", {title: "Create Message"});
    } else {
        res.redirect("/anonymous/login");
    }
}
exports.createMessagePost = [
    body("title", "Message Title Required")
        .trim()
        .isLength({min: 2})
        .escape(),
    body("text", "Message Body Required")
        .trim()
        .isLength({min: 5})
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const message = new Message(
            {
                title: req.body.title,
                body: req.body.text,
                postedBy: req.user.id, 
            }
        );
        if (!errors.isEmpty()) {
            res.render("createMsg", {title: "Create Message", message: message, errors: errors.array()});
        } else {
            message.save((err) => {
                if(err) {
                    next(err);
                }
                res.redirect("/anonymous/messages");
            });
        }
    }
]

exports.deleteMessage = (req, res, next) => {
    if(req.user.admin) {
        Message.findByIdAndRemove(req.params.id, (err, removed) => {
            if(err) {
                return next(err);
            }
            res.redirect("/anonymous/messages");
        });
    } else {
        res.redirect("/anonymous/messages");
    }
}