/**
*	Created by JBH on 2015/2/28.
*	MVC Controller
**/

var mongodb = require('./../config/db');
var crypto = require('crypto');

var User = require('./../models/user');

module.exports = User;

//Store user information
User.prototype.save = function(callback){
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "http://www.gravatar.com/avatar" + email_MD5 + "?s=48";
	//user object
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		head: head
	};

	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read users collection
		db.collection('users', function(err, collection){
			if(err){
				monogo.close();
				return callback(err);// return error information
			}
			//insert user data to users collection
			collection.insert(user,{
				safe: true
			},
			function(err, user){
				mongodb.close();
				if(err){
					return callback(err); //error 
				}
				callback(null, user[0]); // success, err is null
			});
		});
	});
};

//Read user information
User.get = function(name, callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err); // return error info
		}
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			// retrive user by name
			collection.findOne({name: name}, function(err, user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, user);// success, return user
			});
		});
	});
};