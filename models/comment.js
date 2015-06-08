/**
* Created by JBH on 2015/3/2
*/

var mongodb = require('./../config/db');

var ObjectID = require('mongodb').ObjectID;

//new add
function Comment(_id, comment){
	this._id = _id;
	this.comment = comment;
}

module.exports = Comment;

/**
* Save comment
* @param callback
*/

Comment.prototype.save = function(callback){
	var _id = this._id,
		comment = this.comment;
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//get collections
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({
				"_id": new ObjectID(_id)
			}, {
				$push: {comments: comment}
			}, function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};