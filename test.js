'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
 
var app = express();
 
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.route('/single/:id')
	.get(function (req, res) {
    res.render('single-poll', {
    	id: req.params.id
    });
	});

app.listen(process.env.PORT,  function () {
	console.log('Node.js listening on port ' + process.env.PORT + '...');
});
