var path          = require('path');
var router        = require('express').Router();     
var User          = require('../models/User');           
var passport      = require('passport');                 
var LocalStrategy = require('passport-local').Strategy;  

/////////////////////////////////////////////////////////////
// Serialization/deserialization of user ////////////////////
/////////////////////////////////////////////////////////////

passport.serializeUser(function(user, done) { done(null, user.id); });                                             
passport.deserializeUser(function(id, done) { User.getUserById(id, function(err, user) { done(err, user); }); });  

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.comparePassword(username, password, function(err, isMatch, user){   // Compares Passwords
            if(err)     { console.log(err);         }                               // Console  Logs error
            if(isMatch) { return done(null, user);  }                               // Sucess!  Returns user
            else        { return done(null, false); }                               // Failute! Return false
        });
    }
));

/////////////////////////////////////////////////////////////
///// USER Manaement (POSTS) ////////////////////////////////
/////////////////////////////////////////////////////////////

router.post('/login',    function(req, res, next){
    
    var username  = req.body.username;  
    var password  = req.body.password;

    if (username.length < 3 || password.length <3 || username.length > 16 || password.length > 16)
    {
        return res.status(500).send("Failed login: Invalid username/password!");
    }

    passport.authenticate('local', function(err, user, info) {
        if (err)   { console.log(error); }                                             // logs error if error
        if (!user) { return res.status(500).send("Failed login: no such user!"); }     // Returns failure message if failed login
        req.logIn(user, function(err) {                                                // Attempts to log in User
            if (err){ return res.status(500).send("Failed login: server error!"); }       // If error sends error messsage
            else    { return res.send("Login Sucessfull!");         }                     // Send sucess message  
        });
    })(req, res, next);
});

router.post('/register', function(req, res, next){
    
    var username  = req.body.username;
    var password  = req.body.password;

    User.getUserByUsername(username, function(err,user) {
        if (err) return res.status(500).send("Error accessing the database: " + err + "!");

        User.createUser(username,password,function(err, user){            
            if (err) return res.status(500).send("Error creating user: " + err + "!");
 
            passport.authenticate('local', function(err, user, info) {
                if (err) return res.status(418).send("Failed to login after account creation!");

                req.logIn(user, function(err) {
                    if (err) return res.send("Failed to login after account creation!");
                    return res.send("login Sucessfull!");
                });
            })(req, res, next);
        });

    });        
});

/////////////////////////////////////////////////////////////
///// USER INPUTS (POSTS) ///////////////////////////////////
/////////////////////////////////////////////////////////////

router.post('/createexpense', function(req,res){
    
    if(!req.user)
    { 
        return res.status(500).status("Error creating expense: No user logged in!")
    }
    
    var newExpense = {
        value        : req.body.value,
        date         : req.body.date,           
        type         : req.body.type,    
        description  : req.body.description
    }

    User.createExpense(req.user._id, newExpense, 
        function(err, expense) {
            if(err)
            { 
                return res.status(500).send("Error creating expense: " + err + "!") 
            }
            else   
            { 
                return res.send(expense);        
            }
        }
    );
});

router.post('/savebackup',    function(req,res){
    if(!req.user){ 
        return res.status(500).status("Error saving backup: No user logged in!")
    }
    
    var recursiveCallback = function(i,nDocuments,err){

        if( i >= nDocuments){ return res.send("" + i + " documents saved"); }
        if( err )           { return res.status(500).send(err);             }

        var expense = {
            value        : req.body[i].value,
            date         : req.body[i].date,           
            type         : req.body[i].type,    
            description  : req.body[i].description
        }

        i++;

        User.createExpense(req.user._id,expense, function(err,id){
            if(err){ return res.status(500).send(err); }
            return recursiveCallback(i,nDocuments,null);
        });
    }

    recursiveCallback(0,req.body.length,null); 

});

router.post('/getexpenses',   function(req,res){
    
    if(!req.user){ 
        return res.status(500).status("Error getting expenses: No user logged in!")
    }

    var numberofAssyncCalls = 2;
    var responseObject = {
        expenses:       null,
        timeStatistics: null,
        types:          null,
        totalExpenses:  null
    }

    User.getExpenses(req.user._id,function(err, expenses) {
        if(err){ 
            return res.status(500).send("Error getting expenses: " + err + "!"); 
        }
        else   
        { 
            numberofAssyncCalls--;
            responseObject.expenses = expenses;
            if(numberofAssyncCalls == 0){ 
                res.send(responseObject); 
            }                        
        }
    });

    User.getStatistics(req.user._id,function(err, statistics) {
        if(err){ 
            return res.status(500).send("Error getting statistics: " + err + "!"); 
        }
        else   
        { 
            numberofAssyncCalls--;
            responseObject.totalExpenses  = statistics.totalExpenses;
            responseObject.timeStatistics = statistics.timeStatistics
            responseObject.types          = statistics.types            

            if(numberofAssyncCalls == 0){ 
                res.send(responseObject); 
            }
        }
    });
});

router.post('/updateexpense', function(req,res){
    
    if(!req.user)
    { 
        return res.status(500).status("Error updating expense: No user logged in!")
    }
    
    var expense = {
        _id          : req.body._id,
        value        : req.body.value,
        date         : req.body.date,           
        type         : req.body.type,    
        description  : req.body.description
    }

    User.updateExpense(req.user._id,expense,function(err, expense) {
        if(err)
        { 
            return res.status(500).send("Error updating expense: " + err + "!"); 
        }  
        else   
        { 
            return res.send(expense);         
        }
    });
});

/////////////////////////////////////////////////////////////
module.exports = router;