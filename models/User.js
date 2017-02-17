var mongoose  = require('mongoose'); // Mongoose
var bcrypt    = require('bcryptjs'); // Used to hash passwords

// Mongoose model User is defined. User contianes [expense] & [dailyExpens]
// methods' callback functions return an error message on first parameter. 

var Expense = mongoose.Schema({                                 
    date:        { type: Date,   required: true, default: Date.now() },  
    value:       { type: Number, required: true                      },                        
    type:        { type: String, required: true                      },                        
    description: { type: String                                      }                         
});

var dailyExpense = mongoose.Schema({
    _id:      { type: String},
    day:      { type: Number, default: 0.0 },
    month:    { type: Number               },
    year:     { type: Number               },
    expenses: { type: Number               },
    type:     { type: String               } 
});

var expenseType = mongoose.Schema({
    name:      { type: String},
    count:     { type: Number, default: 0.0 },
    value:     { type: Number, default: 0.0 }
});

var UserSchema = mongoose.Schema({                                
    username:       { type: String,  required: true, unique: true },
    password:       { type: String,  required: true               },
    totalexpenses:  { type: Number, default: 0.0                  },
    expenses:       [ Expense                                     ],
    timestatistics: [ dailyExpense                                ],   
    expensetypes:   [ expenseType ]
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports = {

    createUser:         
    function(username,password,callback){                        
        // Callback(errormessage,user._Id)                          
        bcrypt.hash(password, 10, function(err, hash) {               
            if(err){ 
                return callback("error hashing the password",null) 
            }  

            if (username.length < 3){
                return callback("username length is less than three characters",null); 
            }

            if (password.length <3){
                return callback("password length is less than three characters",null); 
            }

            if (username.length > 16){
                return callback("password length is more than sixteen characters",null); 
            }

            if (password.length > 16){
                return callback("password length is more than sixteen characters",null); 
            }

            var newUser = new User({                                     
                username: username,                                         
                password: hash                                             
            });

            newUser.save(function(err,user,numAffected){              
                if(err){ 
                    return callback("it was not possible to create the user",null); 
                }                          
                else{ 
                    return callback(null,user._Id); 
                }   
            });                                   
        });
    },

    getUserByUsername:
    function(username,callback){                                 
        User.findOne({username: username})
            .select('-password')
            .exec(function(err,user){
                if(err){ 
                    return callback("error fetching use by username",null)
                }
                else{ 
                    return callback(null,user)
                }
            })                                           
    },
    
    comparePassword:    
    function(username,candidatePassword,callback){               
        User.findOne({username: username})                              
           .select('password')                                         
           .exec(function(err,user){                                   
                if(err || !user) { return callback("No user found",false,null); }                
                bcrypt.compare(candidatePassword, user.password,           
                    function(err, isMatch) { 
                        // isMatch = result from the compare (true || false)                                  
                        if(err){ 
                            return callback("Error comparing the password" ,false,null);    
                        }      
                        else if(!isMatch){ 
                            return callback(null,false,null);    
                        }
                        else{ 
                            return callback(null,true,user);     
                        }
                    }
                );
        });
    }, 

    getUserById:        
    function(iduser,callback){                                   
        User.findById(iduser)                                          
            .select('-password')                                       
            .exec(function(err,user){                                  
                if(err){ 
                    return callback("error getting user",null);
                }                   
                else{ 
                    return callback(null,user)
                }                 
            });                                         
    },  

    createExpense:  
    function(userID,expense,callback){                           
        User.findById(userID,function(err,user){                 
            if(err){ 
                return callback("error getting user", null) 
            }                        

            // Default date to now if no date provided
            if (expense.date == ''){ date = Date.now(); }                 
            
            if(!expense.type || !expense.value)
            {
                return callback('Incomplete information!',null); 
            }

            var newExpense = {
                date        : expense.date,
                value       : expense.value,
                type        : expense.type,
                description : expense.description
            }                                                       
            user.expenses.push(newExpense);
            user.save(callback(null,user.expenses[user.expenses.length -1]));
        });                
    },
     
    getExpenses:    
    function(userID,callback){                                   
        User.findById(userID,function(err,user){                 
            
            if(err) { 
                return callback("error getting user", null);
            }                         
            else { 
                callback(null,user.expenses.sort(function(a,b){

                    // Trim date to ~ the yyyymmdd                    
                    var dateA = Math.floor(Date.parse(a.date) / 1000 / 60 / 60 / 24);     
                    var dateB = Math.floor(Date.parse(b.date) / 1000 / 60 / 60 / 24);

                    // sorts by date, or by type
                    if ( dateB  - dateA  ){ return b.date - a.date; }
                    if ( a.type < b.type ){ return -1; }
                    if ( a.type > b.type ){ return  1; }
                    else                  { return  0; }
                })); 
            }
        });
    },

    getStatistics:    
    function(userID,callback){                                   
        User.findById(userID,function(err,user){                 
            
            if(err) { 
                return callback("error getting user", null);
            }                         
            else { 
                callback(null,{
                    totalexpenses:  user.totalexpenses,
                    timestatistics: user.dailyExpenses,
                    types:          user.expensetypes.sort(function(a,b){
                                        return b.count - a.count;
                                    })  
                }); 
            }
        });
    },

    updateExpense: 
    function(userID,expenseinput,callback){                      
        User.findById(userID,function(err,user){                 
            
            if(err){ 
                return callback("error getting the user", null) 
            } 
            if(!expenseinput.type || !expenseinput.value || !expenseinput._id || !expenseinput.date){
                return callback('incomplete information',null); 
            }
            if(!user.expenses.id(expenseinput._id)){ 
                return callback("expense not found",null); 
            }

            user.expenses.id(expenseinput._id).value       = expenseinput.value;
            user.expenses.id(expenseinput._id).type        = expenseinput.type;
            user.expenses.id(expenseinput._id).description = expenseinput.description;
            user.expenses.id(expenseinput._id).date        = expenseinput.date;

            user.save(function(err,updateduser){
                if(err){
                    callback("error saving the updated expense");
                }
                else{
                    callback(null,updateduser.expenses.id(expenseinput._id));
                }
                
            });
        });
    }, 

    resetStatistics:
    function(userID,callback){                                   
        User.findById(userID,function(err,user){                 
            if(err){ 
                return callback("error getting user", null) 
            }

            // Removing the statistic data stored
            user.totalexpenses = 0;

            if(!user.timestatistics){ user.timestatistics = []; }
            if(!user.expensetypes){   user.expensetypes   = []; }
                
            for(var i = 0; i<user.timestatistics.length; i++){
                user.timestatistics.id(user.timestatistics[i]._id)
            }

            for(var i = 0; i<user.expensetypes.length; i++){
                user.expensetypes[i].count = 0;
            }

            // Creating new statistical data
            for(var i = 0; i<user.expenses.length; i++){
                
                var constructedID =  user.expenses[i].date.getFullYear()   + '-'
                                  + (user.expenses[i].date.getMonth() + 1) + '-'
                                  +  user.expenses[i].date.getDay();
                
                for (var j = 0; j<=user.expensetypes.length; j++){

                    if( j == user.expensetypes.length ){
                        var newExpenseType = {
                            name: user.expenses[i].type,
                            count: 1.0,
                            value: 0.0
                        }
                       
                        user.expensetypes.push(newExpenseType);
                        break;
                    }

                    if( user.expensetypes[j].name.replace(/\s+/g, '').toLowerCase() ==
                        user.expenses[i].type.replace(/\s+/g, '').toLowerCase() ){

                        user.expensetypes[j].count++;
                        user.expensetypes[j].value += expenses[i].value;
                        break;
                    }

                }

                user.totalexpenses += user.expenses[i].value;
            } 
            
            user.save(function(err,updateduser){
                if(err) 
                { 
                    return callback("error saving statistics",null); 
                }
                else    
                { 
                    return callback(null,updateduser.expensetypes); 
                }
            });
        })
    }
    
}