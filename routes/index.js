var express = require('express');
var router = express.Router();

//import controllers
var User = require('../controllers/user_controller.js');
var Post = require('../controllers/post_controller.js');
var Comment = require('../models/comment.js');

//import MD5 component
var md5 = require('../lib/md5.js');

/* GET home page. */
router.get('/', function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Post.getTen(null, page, function(err, posts, total){
		if(err){
			posts = [];
		}
		res.render('index', { 
  		title: 'Home',
  		posts: posts,
  		page: page,
  		isFirstPage: (page - 1) == 0,
  		isLastPage: ((page - 1) * 10 + posts.length) == total,
  		user: req.session.user,
  		success: req.flash('success').toString(),
    	error: req.flash('error').toString()
  		});
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

router.get('/post', checkLogin);
router.get('/post', function(req, res){
	res.render('post', {
		title: 'Post',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/post', checkLogin);
router.post('/post', function(req, res){
	//get data from client
	var currentUser = req.session.user,
		tags = [req.body.tag1, req.body.tag2, req.body.tag3],
		post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
	//save data
	post.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', 'Post successfully');
		res.redirect('/');
	});
});

//Get article
router.get('/p/:_id', checkLogin);
router.get('/p/:_id', function(req, res){
	Post.getOne(req.params._id, function(err, post){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('article',{
			title: post.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//comment
router.post('/p/:_id', checkLogin);
router.post('/p/:_id', function(req, res){
	var date = new Date(),
		time = date.getFullYear() + "-" + (date.getMonth() + 1) + date.getDate() + " " +
			date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes():date.getMinutes());

	var email_MD5 = md5(req.body.email.toLowerCase()),
		head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";

	var comment = {
		name: req.body.name,
		head: head, 
		time: time,
		email: req.body.email,
		website: req.body.website,
		content: req.body.content
	};

	var newComment = new Comment(req.params._id, comment);
	newComment.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', 'Comment successfully');
		res.redirect('back');
	});
});

//edit
router.get('/edit/:_id', checkLogin);
router.get('/edit/:_id', function(req,res){
	Post.edit(req.params._id, function(err, post){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		res.render('edit', {
			title: 'Edit',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});


//edit post
router.post('/edit/:_id', checkLogin);
router.post('/edit/:_id', function(req, res){
	Post.update(req.params._id, req.body.post, function(err){
		var url = encodeURI('/p/' + req.params._id);
		if(err){
			req.flash('error', err);
			return res.redirect(url);
		}
		req.flash('success', 'Update successfully');
		res.redirect(url); //return current page
	});
});

//delete
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function(req, res){
	Post.remove(req.params.name, req.params.day, req.params.title, function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', 'Delete successfully');
		res.redirect('/');
	});
});

//get orginal link
router.get('/u/:name/:day/:title', function(req, res){
	Post.getReprint(req.params.name, req.params.day, req.params.title, function(err, post){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		//
		if(post == null){
			req.flash('error', 'Content is blank');
			return res.redirect('/');
		}
		res.render('article', {
			title: post.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//forward article
router.get('/reprint/:_id', checkLogin);
router.get('/reprint/:_id', function(req, res){
	Post.edit(req.params._id, function(err, post){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		var currentUser = req.session.user,
			reprint_from = {name: post.name, day: post.time.day, title: post.title},
			reprint_to = {name: currentUser.name, head: currentUser.head};
		Post.reprint(reprint_from, reprint_to, function(err, post){
			if(err){
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', 'Forward successfully');
			var url = encodeURI('/p/' + post._id);
			res.redirect(url);
		});
	});
});

//get archive
router.get('/archives', function(req, res){
	Post.getArchive(function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('archive', {
			title: 'Archive',
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//get tags
router.get('/tags', function(req, res){
	Post.getTags(function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('tags', {
			title: 'Tags',
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//get articles of tags
router.get('/tags/:tag', function(req, res){
	Post.getTag(req.params.tag, function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('tag',{
			title: 'TAG:' + req.params.tag,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//search articles
router.get('/search', function(req, res){
	Post.search(req.query.title, function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('search', {
			title: 'SEARCH:' + req.query.title,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//Get articles by user
router.get('/u/:name', function(req, res){
  var page = req.query.p ? parseInt(req.query.p) : 1;
  User.get(req.params.name, function(err, user){
    if(!user){
      req.flash('error', 'User not exist');
      return res.redirect('/');
    }
    //return articles
    Post.getTen(user.name, page, function(err, posts, total){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });
});

//links
router.get('/links', function(req, res){
	res.render('links', {
    title: 'Frinds Links',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});


//404 page
router.use(function(req, res){
	res.render('404');
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
