var express = require('express');
var router = express.Router();
const adminHelper = require('../Helpers/adminHelpers');




//session checking middlewares
const verifyLogin = function(req,res,next){
  if(req.session.admin){
    next();
  }else{
    res.redirect('/admin')
  }
}
 

const checkLogin = function(req,res,next){
  if(req.session.admin){
    res.redirect('/admin/home')
  }
  else{
    next();
  }
}


/* GET home page. */
router.get('/', checkLogin,function(req, res, next) {
  res.render('Admins/admin-login');
});

router.get('/home',verifyLogin,(req,res)=>{
    adminHelper.getUsers().then((users)=>{

      
      res.render('Admins/admin-home',{name:req.session.admin._id,users})
    })
})

router.post('/',(req,res)=>{
  adminHelper.doLogin(req.body).then((response)=>{
    if(response.status === true){
      req.session.admin = response.adminDetails
      
      res.redirect('/admin/home')
    }else if(response.admin === true)
    {
         res.render('./Admins/admin-login',{error:'Invalid credentials'})
    }
    else{
      res.render('./Admins/admin-login',{error:'user does not exist'});
      
    }

  })

})

router.get('/signup',checkLogin,(req,res)=>{
  res.render('./Admins/admin-signup')
})

router.post('/signup',(req,res)=>{
  adminHelper.doSignup(req.body).then((response)=>{
    if(response.status){
      req.session.admin = response.admin
      res.redirect('/admin/home')
    }
    else{
      res.render('./Admins/admin-signup',{message:response.message})
    }
  })
})  

router.get('/signout',(req,res)=>{
  req.session.admin = null;
  res.redirect("/admin");
})


router.get('/delete-user/:id',verifyLogin,(req,res)=>{
  adminHelper.deleteUser(req.params.id).then(()=>{

    res.redirect('/admin/home')
  })
})

router.get('/edit-user/:id',verifyLogin,(req,res)=>{
  adminHelper.getUserDetails(req.params.id).then((user)=>{
    res.render('Admins/edit-user',{user});
  });
});

router.post('/edit-user/:id',(req,res)=>{
  adminHelper.editUserDetails(req.params.id,req.body.email).then(()=>{
    res.redirect('/admin/home');
  });
});

router.get('/create-user',verifyLogin,(req,res)=>{
  res.render('Admins/create-user')
})

router.post('/create-user',(req,res)=>{
  adminHelper.createUser(req.body).then((result)=>{
    if(result.status){
      res.redirect('/admin/home')
    }else{
      res.render('Admins/create-user',{message:result.message});
    }
  })
})




module.exports = router;