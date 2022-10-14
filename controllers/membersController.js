const {body, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const Member = require("../models/Member");
const passport = require("passport");

exports.index = (req, res) => {
    res.render("index", {title: "Members"});
};

// Signup
exports.signupGet = (req, res) => {
    res.render("signup", {title: "Signup"});
}
exports.signupPost = [
    body("f_name", "First name required")
        .trim()
        .isLength({min: 0})
        .escape(),
    body("l_name", "Last name required")
        .trim()
        .isLength({min: 0})
        .escape(),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid Email")
        .escape(),
    body("password", "Password must be longer than 8 characters")
        .trim()
        .isLength({min: 8})
        .escape(),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
    
        // Indicates the success of this synchronous custom validator
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors.array())
            res.render("signup", {title: "Signup", errors: errors.array()});
        } else {
            bcrypt.hash(req.body.password, 10, (err, hashedPass) => {
                if(err) {
                    return next(err);
                }
                const user = new Member(
                    {
                        f_name: req.body.f_name,
                        l_name: req.body.l_name,
                        email: req.body.email,
                        password: hashedPass
                    }
                );
                user.save((err) => {
                    if (err) {
                        next(err);
                    }
                    res.redirect("/anonymous/login");
                });
            });
        }
    }

]

// Login
exports.loginGet = (req, res) => {
    res.render("login", {title: "Login", messages: req.session.messages});
}
exports.loginHandler = [passport.authenticate("local", 
    {failureRedirect: "/anonymous/login", failureMessage: true}),
    (req, res) => {
        res.redirect("/anonymous/messages");
    }
]
// Logout
exports.logout = (req, res, next) => {
    req.logout((err => {
        if(err) {
            next(err);
        }
        res.redirect('/');
    }));
}

//Join Club
exports.joinGet = (req, res) => {
    if(req.user) {
        if (!req.user.status) {
            res.render("join", {title: "Join"});
        } else {
            res.redirect("/anonymous/messages")
        }
    } else {
        res.redirect("/anonymous/login")
    }
}
exports.joinPost = (req, res, next) => {
    if(req.user) {
        if (!req.user.status) {
            req.user.status = true;
            if (req.body.code === "welcome") {
                Member.findByIdAndUpdate(req.user._id, req.user).exec(err => {
                    if(err) {
                        next(err);
                    }
                    res.redirect("/anonymous/messages");
                });
            } else {
                res.redirect("/anonymous/messages");
            }
        } else {
            res.redirect("/anonymous/messages");
        }
    } else {
        res.redirect("/anonymous/login");
    }
}
