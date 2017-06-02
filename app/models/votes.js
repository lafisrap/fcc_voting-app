'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
    Id: String,
    PollId: String,
    Date: String,
    Answer: Number
});

module.exports = mongoose.model('Vote', Vote);
