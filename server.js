var express = require('express.io'),
	swig = require('swig'),
	_ = require('underscore');

var ex_session = require('express-session');

var RedisStore = require('connect-redis')(ex_session);	

var server = express();

var users = [];

//configuracion para renderizar vistas
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './app/views');

// Agregamos post. cookies y sessiones
server.configure(function () {
	server.use(express.logger());
	server.use(express.cookieParser());
	server.use(express.bodyParser());

	server.use(express.session({
		secret : "lolcatz",
		store : new RedisStore({})
		//store : new RedisStore({
		//	host : conf.redis.host,
		//	port : conf.redis.port,
		//	user : conf.redis.user,
		//	pass : conf.redis.pass
		//});

	}));

});

var isntLoggedIn = function (req,res,next) {
	if (!req.session.user) {
		res.redirect('/');
		return;
	}
	next();
};

var isLoggedIn = function (req,res,next) {
	if (req.session.user) {
		res.redirect('/app');
		return;
	}
	next();
};

server.get('/', isLoggedIn, function (req,res) {
	res.render('Home');
});

server.get('/app', isntLoggedIn, function (req,res) {
	res.render('app', {
		user : req.session.user,
		users : users
	});
});

server.post('/log-in', function (req,res) {
	users.push(req.body.username);
	req.session.user = req.body.username;
	res.redirect('/app');
});

server.get('/log-out', function (req,res) {
	users = _.without(users, req.session.user);

	req.session.destroy();
	res.redirect('/');
});

server.listen(3000);