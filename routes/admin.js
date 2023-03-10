const { response } = require("express");
var express = require("express");
var router = express.Router();
const adminHelper = require("../Helpers/adminHelpers");

let previousId = "";
//session checking middlewares
const verifyLogin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else  {
    res.redirect("/admin");
  }
};

const checkLogin = function (req, res, next) {
  if (req.session.admin) {
    res.redirect("/admin/home");
  }else if(req.session.user){
    res.redirect('/home');
  }
   else {
    next();
  }
};

/* GET home page. */
router.get("/", checkLogin, function (req, res, next) {

    res.render("Admins/admin-login",{error:req.session.adminErrors})
    req.session.adminErrors = null;


});

router.get("/home", verifyLogin, (req, res) => {

  if(req.session.searchData){
    res.render("Admins/admin-home",{name:req.session.admin.username,users: req.session.searchData});
    req.session.searchData = null;
  }
  adminHelper.getUsers().then((users) => {

    res.render("Admins/admin-home", {
      name: req.session.admin.username,
      users,
    });
  });
});

router.post("/", (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    if (response.status === true) {
      req.session.admin = response.adminDetails;

      res.redirect("/admin/home");
    } else if (response.admin === true) {
      req.session.adminErrors = 'Invalid credentials';
      res.redirect('/admin');
    } else {
      req.session.adminErrors = 'user does not exist';
      res.redirect('/admin');
    }
  });
});

router.get("/signup", checkLogin, (req, res) => {
  res.render("./Admins/admin-signup", { message: req.session.adminMessages });
  req.session.adminErrors = null;

});

router.post("/signup", (req, res) => {
  adminHelper.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      res.redirect("/admin/home");
    } else {
      req.session.adminErrors = response.message;
      res.redirect("/admin/signup");
    }
  });
});

router.get("/signout", (req, res) => {
  req.session.admin = null;
  req.session.searchData = null;
  res.redirect("/admin");
});

router.get("/delete-user/:id", verifyLogin, (req, res) => {
  adminHelper.deleteUser(req.params.id).then(() => {
    res.redirect("/admin/home");
  });
});

router.get("/edit-user/:id", verifyLogin, (req, res) => {
  adminHelper.getUserDetails(req.params.id).then((user) => {
    previousId = user.username;
    res.render("Admins/edit-user", { user, name: req.session.admin.username,error:req.session.adminErrors });
    req.session.adminErrors = null;
  });
});

router.post("/edit-user/:id", (req, res) => {
  if (previousId != req.body.username) {
    adminHelper.checkUserExist(req.body.username).then((result) => {
      if (result.status) {
        adminHelper.editUserDetails(req.params.id, req.body).then(() => {
          res.redirect("/admin/home");
        });
      } else {
        adminHelper.getUserDetails(req.params.id).then((user) => {
          req.session.adminErrors = 'username already in use';
           res.redirect('/admin/edit-user/'+req.params.id);
        });
      }
    });
  } else {
    adminHelper.editUserDetails(req.params.id, req.body).then(() => {
      res.redirect("/admin/home");
    });
  }
});

router.get("/create-user", verifyLogin, (req, res) => {
  res.render("Admins/create-user", { name: req.session.admin.username ,message:req.session.adminErrors});
  req.session.adminErrors = null;
});

router.post("/create-user", (req, res) => {
  adminHelper.createUser(req.body).then((result) => {
    if (result.status) {
      res.redirect("/admin/home");
    } else {
      req.session.adminErrors = result.message;
   res.redirect('/admin/create-user')
    }
  });
});
router.get("/user-search", (req, res) => {
  console.log(req.query.searchData);
  adminHelper.searchUser(req.query.searchData).then((users) => {
    req.session.searchData = users;
    res.redirect("/admin/home");
  });
});

module.exports = router;
