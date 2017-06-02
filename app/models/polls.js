'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
	userid: String,
	date: String,
	title: String,
	question: String,
	answers: Array()
});

module.exports = mongoose.model('Poll', Poll);
