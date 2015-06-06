/**
 * Created by JBH on 2015/3/24.
 * Model
 * Construct method to create object
 */

function Post(name, head, title, tags, post){
	this.name = name;
	this.head = head;
	this.title = title;
	this.tags = tags;
	this.post = post;
}

module.exports = Post;
