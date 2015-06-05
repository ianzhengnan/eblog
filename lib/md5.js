/**
*	Created by JBH on 2015/4/1
*	Utility functions
**/


var crypto = require('crypto');

//Export MD5 result

module.exports = function md5(str){
	return crypto.createHash('md5').update(str).digest('hex');
};