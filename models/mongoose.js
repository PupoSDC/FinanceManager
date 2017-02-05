var mongoose = require('mongoose')

module.exports = {  

	mongoose: function() {  

		// Fixes promise bug
		mongoose.Promise = global.Promise;

		// Connects to the DataBase
		mongoose.connect("mongodb://localhost:27017/finance");

		// Confirms initialization of the database
		mongoose.connection.on('connected', function () {  
		  console.log('Mongoose is now connected!');
		}); 

		// Connection error event handler
		mongoose.connection.on('error',function (err) {  
		  console.log('Mongoose default connection error: ' + err);
		}); 

		// Disconnected event handler
		mongoose.connection.on('disconnected', function () {  
		  console.log('Mongoose default connection disconnected'); 
		});

		// closes mongoose on server stop
		process.on('SIGINT', function() {  
		  mongoose.connection.close(function () { 
		    console.log('Mongoose default connection disconnected through app termination'); 
		    process.exit(0); 
		  }); 
		}); 

		return mongoose;
	},
};