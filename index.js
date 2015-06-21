// set up ======================================================================
var express  = require('express');
var app      = express();
var port  	 = process.env.PORT || 8787;
//var mongoose = require('mongoose');
//var database = require('./config/database');

var morgan = require('morgan'); 		// log requests to the console (express4)
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration ===============================================================
//mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); 				// set static path
app.use(morgan('dev')); 										// log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// config
var app_config = require('./app/config/app');
app_config.app = app;

// routes 
require('./app/routes');


app.listen(port);
console.log("Storm Proxy listening on port " + port);