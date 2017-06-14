'use strict';

var Users = require('../models/users.js'),
	Polls = require('../models/polls.js');

function PollHandler () {

	this.getPolls = function (req, res) {
		
		let userid = req.user && req.user.github && req.user.github.id || null,
			latestPolls, activePolls, userPolls;
			
		// OTS/Question: How better?
		Polls
			.aggregate({ $sort: { date: -1 }}, { $limit: 100 })
			.exec(function (err, result) {
				if( err ) res.json({"error": err});
				else {
					latestPolls = result;
					
					Polls
						.aggregate({ $sort: { totalVotes: -1 }}, { $limit: 100 })
						.exec(function (err, result) {
							if( err ) res.json({"error": err});
							else  if( userid ) {
								activePolls = result;
								
								Polls
									.aggregate({ $match: { userid }}, { $sort: { date: -1 }}, { $limit: 100 })
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
			answers: q.answers,
			votes: Array.apply(null, Array(q.answers.length)).map(Number.prototype.valueOf,0),
			totalVotes: 0
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
		if( !req.user ) {
			res.json({error: "User not logged in."});
			return;
		}
		
		let q = JSON.parse( req.query.json );

		Polls
			.findById(q.id).remove().exec( (err, result) => {
				if( err ) res.json({ error: err });
				else res.json(result);
			});
	};
	
	this.addVote = function (req, res ) {

		let q = JSON.parse( req.query.json );
		
		Polls
			.findById(q.id).exec(function(err, poll) {
				if( err ) res.json({ error: err });
				else {
					if( q.ownAnswer ) {
						poll.answers.push( q.ownAnswer );
						poll.votes.push( 1 );
						poll.totalVotes = poll.votes.reduce((a,b) => a + parseInt(b), 0);
						
						Polls.update( { 
							_id: q.id 
						}, {
							"$set" : { 
								answers: poll.answers,
								votes: poll.votes,
								totalVotes: poll.totalVotes
							}
						}, {
							upsert: true
						}, (err, poll) => {
							if( err ) console.error(err);
						} );
					} else {
						if( q.answer < 0 || q.answer > poll.votes.length ) {
							res.json({error: "Invalid vote."});	
							return;
						}
						
						poll.votes[q.answer]++;
						poll.totalVotes = poll.votes.reduce((a,b) => a + parseInt(b), 0);
						
						Polls.update( {
							_id: q.id
						}, {
							"$set" : { 
								votes: poll.votes,
								totalVotes: poll.totalVotes
							}
						}, {
							upsert: true
						}, (err, poll) => {
							if( err ) console.error(err);
						});
					}

					res.json(poll);
				}
			});
		
	}

}

module.exports = PollHandler;
