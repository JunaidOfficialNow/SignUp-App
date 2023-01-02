var express = require("express");
const { response } = require("../app");
var router = express.Router();
const userHelper = require("../Helpers/userHelpers");

//declaring middlewares for sessioin management
const verifyLogin = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

const checkLogin = function (req, res, next) {
  if (req.session.user) {
    res.redirect("/home");
  }else if(req.session.admin){
    res.redirect('/admin/home');
  }
   else {
    next();
  }
};

/* GET users listing. */
router.get("/", checkLogin, function (req, res, next) {
  res.render("./Users/user-login" ,{error:req.session.userMessages});
  req.session.userMessages = null;
});

router.get("/home", verifyLogin, (req, res) => {
  res.render("Users/user-home", { name: req.session.user.username });
});

router.post("/", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status === true) {
        req.session.user = response.userDetails;
        res.redirect("/home");
    } else if (response.user === true) {
      req.session.userMessages = 'Invalid credentials';
       res.redirect('/')
    } else {
      req.session.userMessages = 'user does not exist';
      res.redirect('/');
    }
  });
});

router.get("/signup", checkLogin, (req, res) => {
  res.render("./Users/user-signup", { message: req.session.userMessages });
  req.session.userMessages = null;
});

router.post("/signup", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      res.redirect("/home");
    } else {
      req.session.userMessages = response.message;
      res.redirect("/signup");
    }
  });
});

router.get("/signout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

module.exports = router;
