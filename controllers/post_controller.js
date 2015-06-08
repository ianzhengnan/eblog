/**
 * Created by JBH on 2015/3/2
 * Controller
 */

var mongodb = require('./../config/db'),
	markdown = require('markdown').markdown;

var ObjectID = require('mongodb').ObjectID;

//Get model
var Post = require('./../models/post');

module.exports = Post;

/**
 * Post articles
 * @param callback
 */

Post.prototype.save = function(callback){

	var date = new Date();
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" +  date.getDate() + " " + 
			date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + 
					date.getMinutes() : date.getMinutes())
	};
	var post = {
		name: this.name,
		head: this.head,
		time: time,
		title: this.title,
		tags: this.tags,
		post: this.post,
		comments: [],
		reprint_info: {},
		pv: 0
	};
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//get posts collection
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(post,{
				safe: true
			},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);// return null erro
			});
		});
	});
};

/**
 * Read articles
 * @param name author
 * @param page 10 items for 1 page
 * @param callback
 */

Post.getTen = function(name, page, callback){
	//open databse
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}

		//get posts collections
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}

			collection.count(query, function(err, total){
				collection.find(query, {
					skip: (page -1) * 10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function(err, docs){
					mongodb.close();
					if(err){
						return callback(err);
					}
					//parse markdown to html
					docs.forEach(function(doc){
						doc.post = markdown.toHTML(doc.post);
					});
					callback(null, docs);//return search result in array

				});
			});
		
		});
	});
	
};

/**
 * Get single article
 * @param _id article id
 * @param callback
 */

Post.getOne = function(_id, callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//get posts collection
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//get data by user, date and article name
			collection.findOne({
				"_id": new ObjectID(_id)
			},function(err, doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(doc){
					//pv value increase 1 for every visit
					collection.update({
						"_id": new ObjectID(_id)
					},{
						$inc: {"pv": 1}
					},function(err){
						mongodb.close();
						if(err){
							return callback(err);
						}
					});
					//parse markdown to html
					doc.post = markdown.toHTML(doc.post);
					doc.comments.forEach(function(comment){
						comment.content = markdown.toHTML(comment.content);
					});
					callback(null, doc); // return one find article
				}
			});
		});

	});
};

/**
 * Get the forward post article
 * @param name author
 * @param day date of post
 * @param title
 * @param callback
 */

Post.getReprint = function(name, day, title, callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read posts collection
		db.collection("posts", function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//query
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err, doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				//parse markdown to html
				doc.post = markdown.toHTML(doc.post);
				doc.comments.forEach(function(comment){
					comments.content = markdown.toHTML(comment.content);
				});
				callback(null, doc);
			});
		});
	});
};

/**
 * Edit article
 * @param _id article id
 * @param callback
 */

Post.edit = function(_id, callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//read posts
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//query
			collection.findOne({
				"_id": new ObjectID(_id)
			},function(err, doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, doc);
			});
		});
	});
};

/**
 * Update article
 * @param _id article id
 * @param post article content
 * @param callback
 */
Post.update = function(_id, post, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//update article content
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({
				"_id": new ObjectID(_id)
			}, {
				$set: {post: post}
			}, function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(err);
			});
		});
	});
};

/**
 * return archieve articles
 * @param callback
 */
Post.getArchieve = function(callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read posts
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//return name, time and title
			collection.find({
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

/**
 * get tags
 * @param callback
 */
Post.getTags = function(callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			callback(err);
		}
		//get posts
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//get tags
			collection.distinct('tags', function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

/**
 * get all articles in a specifc tag
 * @param tag tag
 * @param callback
 */
Post.getTag = function(tag, callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//get posts
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//retrieve all articles in tags array
			collection.find({
				"tags": tag
			},{
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});

	});
};

/**
 * Search articles
 * @param title
 * @param callback
 */
Post.search = function(title, callback){
	//open database
	if(err){
		return callback(err);
	}
	//read posts
	db.collection('posts', function(err, collection){
		if(err){
			mongodb.close();
			return callback(err);
		}
		var pattern = new RegExp(title, "i");
		collection.find({
			"title": pattern
		},{
			"name": 1,
			"time": 1,
			"title": 1
		}).sort({
			time: -1
		}).toArray(function(err, docs){
			mongodb.close();
			if(err){
				return callback(err);
			}
			callback(null, docs);
		});
	});
};

/**
 * Forward articles
 * @param reprint_from
 * @param reprint_to
 * @param callback
 */
Post.reprint = function(reprint_from, reprint_to, callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//get posts
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//find the source article
			collection.findOne({
				"name": reprint_from.name,
				"time.day": reprint_from.day,
				"title": reprint_from.title
			}, function(err, doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				var date = new Date();
				var time = {
					date: date,
			        year : date.getFullYear(),
			        month : date.getFullYear() + "-" + (date.getMonth() + 1),
			        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
			        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" +
			         (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
				};
				delete doc._id;//the old one should be delete
				
				doc.name = reprint_to.name;
				doc.head = reprint_to.head;
				doc.time = time;
				doc.title = (doc.title.search(/[forword]/) > -1) ? doc.title: "[forword]" + doc.title;
				doc.comments = [];
				doc.reprint_info = {"reprint_from": reprint_from};
				doc.pv = 0;
				
				//update
				collection.update({
					"name": reprint_from.name,
					"time.day": reprint_from.day,
					"title": reprint_from.title	
				},{
					$push: {
						"reprint_info.reprint_to":{
							"name": doc.name,
							"day": time.day,
							"title": doc.title
						}
					}
				},function(err){
					if(err){
						mongodb.close();
						return callback(err);
					}
				}); 
				//
				collection.insert(doc, {
					safe: true
				},function(err, post1){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(err, doc);
				});
			});
		});
	});
};

/**
 * Delete article
 * @param name author
 * @param day post date
 * @param title
 * @param callback
 */
Post.remove = function(name, day, title, callback){
	//open database
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//read posts
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//Retrive deleted data
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			},function(err, doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//
				var reprint_from = "";
				if(doc.reprint_info.reprint_from){
					reprint_from = doc.reprint_info.reprint_from;
				}
				if(reprint_from != ""){
					//
					collection.update({
						"name": reprint_from.name,
						"time.day": reprint_from.day,
						"title": reprint_from.title
					},{
						$pull: {
							"reprint_info.reprint_to":{
								"name": name,
								"day": day,
								"title": title
							}
						}
					},function(err){
						if(err){
							mongodb.close();
							return callback(err);
						}
					});
				}
				//delete forward doc
				collection.remove({
					"name": name,
					"time.day": day,
					"title": title
				},{
					w: 1
				},function(err){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(null);
				});
			});
		});
	});
};


