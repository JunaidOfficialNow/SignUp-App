var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userHelper = require('../Helpers/userHelpers')


//declaring middlewares for sessioin management
const verifyLogin = function(req,res,next){
  if(req.session.user){
    next();
  }else{
    res.redirect('/')
  }
}
 

const checkLogin = function(req,res,next){
  if(req.session.user){
    res.redirect('/home')
  }
  else{
    next();
  }
}

/* GET users listing. */
router.get('/',checkLogin, function(req, res, next) {
  res.render('./Users/user-login');
});

router.get('/home',verifyLogin,(req,res)=>{
  res.render('Users/user-home',{name:req.session.user.username})
})

router.post('/',(req,res)=>{
    userHelper.doLogin(req.body).then((response)=>{
      if(response.status === true){
        req.session.user = response.userDetails
        
        res.redirect('/home')
      }else if(response.user === true)
      {
           res.render('./Users/user-login',{error:'Invalid credentials'})
      }
      else{
        res.render('./Users/user-login',{error:'user does not exist'});
      
      }

    })

})

router.get('/signup',checkLogin,(req,res)=>{
  res.render('./Users/user-signup')
})

router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    if(response.status){
      req.session.user = response.user
      res.redirect('/home')
    }
    else{
      res.render('./Users/user-signup',{message:response.message})
    }
  })
})

router.get('/signout',(req,res)=>{
     req.session.user = null;
     res.redirect("/");
})

module.exports = router;
