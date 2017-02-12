var path          = require('path');  
var express       = require('express');  
var bodyParser    = require('body-parser');                       
var exphbs        = require('express-handlebars');
var mongoose      = require('./models/mongoose.js').mongoose();

// Init App
var app = express();

app.engine('handlebars',  exphbs.create({}).engine )
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));

app.use(express.static(path.resolve(__dirname, './public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('*', function(req, res){ res.render('index'); }); // Single page app, get returns index ALWAYS!
app.use('/', require('./routes/dash')  );                 // Handles dash board

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port')); 

console.log('Node app is running on port', app.get('port'));
