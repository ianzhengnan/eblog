var express = require('express');
var router = express.Router();

//import controllers
var User = require('../controllers/user_controller.js');


//import MD5 component
var md5 = require('../lib/md5.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Express',
  	user: req.session.user,
  	success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});


router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res){
	res.render('register', {
		title: 'Register',
		user: req.session.user,
		success: req.flash('success').toString(),
        error: req.flash('error').toString()
	})
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res){
	//Get user data from view
	var username = req.body.username;// user name
	var password = req.body.password;//pass word
	var password_rp = req.body['password-repeat'];// password repeat
	if(password_rp !== password){
		req.flash('error', 'Password not consisidency for twice input');
		return res.redirect('/reg'); //back to register page
	}

	//generate md5 password
	password = md5(password);
	var newUser = new User({
		name: username,
		password: password,
		email: req.body.email
	});

	//check whether user exist or not
	User.get(newUser.name, function(err, user){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		if(user){
			req.flash('error', 'User exist');
			return res.redirect('/reg');
		}
		//if user not exist, create one
		newUser.save(function(err, user){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			req.session.user = user;
			req.flash('success', 'Register successfully');
			res.redirect('/')
		});
	});

});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res){
	res.render('login', {
		title: 'Login',
		user: req.session.user,
		success: req.flash('success').toString(),
        error: req.flash('error').toString()
	})
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res){
	//generate md5
	var password = req.body.password;
	User.get(req.body.username, function(err, user){
		if(!user){
			req.flash('error', 'User not exist');
			return res.redirect('/login');
		}
		//check user name and password
		if(user.password != md5(password)){
			req.flash('error', 'Password incorrect');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', 'Sign in successfully');
		res.redirect('/');
	});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res){
	req.session.user = null;
	req.flash('success', 'Sign out successfully');
	res.redirect('/login')
});

//authority check
function checkLogin(req, res, next){
	if(!req.session.user){
		req.flash('error', 'No sign in yet');
		return res.redirect('/login');
	}
	next();
}


function checkNotLogin(req, res, next){
	if(req.session.user){
		req.flash('error', 'You already sign in');
		return res.redirect('/');
	}
	next();
}

module.exports = router;