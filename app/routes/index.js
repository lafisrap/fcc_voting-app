'use strict';

var path = process.cwd();
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var pollHandler = new PollHandler();

	app.route('/')
		.get(function (req, res) {
			if( req.isAuthenticated() ) {
				res.sendFile(path + '/public/index-loggedin.html');
			} else {
				res.sendFile(path + '/public/index.html');
			}
		});

	app.route('/single/:id')
		.get(function (req, res) {
	    	res.render('single-poll', {
	    		id: req.params.id,
	    		title: "TEST",
	    		text: "Dies ist ein Text ..."
	    	});
		});


	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(function (req, res) {
			if( req.isAuthenticated() ) {
				res.json(req.user.github);
			} else {
				res.json({});
			}
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/polls')
		.get(pollHandler.getPolls)
		.post(isLoggedIn, pollHandler.addPoll)
		.delete(isLoggedIn, pollHandler.removePoll);

	app.route('/api/:id/vote')
		.post(pollHandler.addVote);
		
	app.route('/api/:id/poll')
		.get(pollHandler.getSinglePoll)
};
