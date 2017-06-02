'use strict';

var Users = require('../models/users.js'),
	Polls = require('../models/polls.js');

function PollHandler () {

	this.getPolls = function (req, res) {
		
		let userid = req.user.github && req.user.github.id || null,
			latestPolls, activePolls, userPolls;

		Polls
			.aggregate({ $sort: { date: 1 }}, { $limit: 100 })
			.exec(function (err, result) {
				if( err ) res.json({"error": err});
				else {
					latestPolls = result;
					
					Polls
						.aggregate({ $sort: { votes: 1 }}, { $limit: 100 })
						.exec(function (err, result) {
							if( err ) res.json({"error": err});
							else  if( userid ) {
								activePolls = result;
								
								Polls
									.aggregate({ $match: { userid }}, { $sort: { date: 1 }}, { $limit: 100 })
									.exec(function (err, result) {
										userPolls = result;
											
										if( err ) res.json({"error": err});
										else {
											res.json({latestPolls, activePolls, userPolls});
										}
									});
							} else {
								res.json({latestPolls, activePolls});
							}
						});
				}
			});
	};

	this.addPoll = function (req, res) {

		if( !req.user ) {
			res.json({error: "User not logged in."});
			return;
		}
		
		let q = JSON.parse( req.query.json );
		console.log(q);

		var Poll = new Polls({
			userid: req.user.github.id,
			date: new Date().getTime(),
			title: q.title,
			question: q.question,
			answers: q.answers
		});
		
		Poll.save((err, poll) => {
			if( err ) {
				console.error(err);
				res.json({error: err});
			}
			else {
				res.json({});
			}
		})
	};

	this.removePoll = function (req, res) {
		Users
			.findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.nbrClicks);
				}
			);
	};

}

module.exports = PollHandler;
