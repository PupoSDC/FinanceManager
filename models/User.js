var mongoose  = require('mongoose'); // Mongoose
var bcrypt    = require('bcryptjs'); // Used to hash passwords

// Mongoose model User is defined. User contianes [expense] & [dailyExpens]
// methods' callback functions return an error message on first parameter. 

var Expense = mongoose.Schema({                                 
    date:           { type: Date,   required: true, default: Date.now() },  
    value:          { type: Number, required: true                      },                        
    type:           { type: String, required: true                      },                        
    description:    { type: String                                      }                         
});

var expenseType = mongoose.Schema({
    name:           { type: String               },
    count:          { type: Number, default: 0.0 },
    value:          { type: Number, default: 0.0 }
});

var dailyExpense = mongoose.Schema({
    day:            { type: Number               },
    month:          { type: Number               },
    year:           { type: Number               },
    count:          { type: Number               },
    value:          { type: Number               },
    expenseTypes:   [ expenseType ]
});

var UserSchema = mongoose.Schema({                                
    username:       { type: String,  required: true, unique: true },
    password:       { type: String,  required: true               },
    totalExpenses:  { type: Number, default: 0.0                  },
    expenses:       [ Expense                                     ],
    timeStatistics: [ dailyExpense                                ],   
    expenseTypes:   [ expenseType ]
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

            // Update to the user statistics
            var expenseDateObj = new Date(expense.date);

            for (var i = 0; i<= user.expenseTypes.length;   i++){
                
                // If this expense type does not exist
                if( i == user.expenseTypes.length ){
                    var newExpenseType = {
                        name:  expense.type,
                        count: 1.0,
                        value: expense.value
                    }
                   
                    user.expenseTypes.push(newExpenseType);
                    break;
                }

                // If this expense type matches an existing expense type
                if( user.expenseTypes[i].name.replace(/\s+/g, '').toLowerCase() ==
                    expense.type.replace(/\s+/g, '').toLowerCase() ){

                    user.expenseTypes[i].count++;
                    user.expenseTypes[i].value += expense.value;
                    break;
                }
            }

            for (var i = 0; i<=user.timeStatistics.length; i++){
                
                // If this expense day is not counted yet
                if( i == user.timeStatistics.length ){    

                    var newDailyExpense = {
                        day:            expenseDateObj.getDay(),
                        month:          expenseDateObj.getMonth(),
                        year:           expenseDateObj.getFullYear(),
                        count:          1,
                        value:          expense.value,
                        expenseTypes:   [{ 
                                            name:  expense.type,
                                            count: 1.0,
                                            value: 0.0
                                        }]
                    }
                   
                    user.timeStatistics.push(newDailyExpense);
                    break;
                }

                if( user.timeStatistics[i].day   == expenseDateObj.getDay()      &&
                    user.timeStatistics[i].month == expenseDateObj.getMonth()    &&
                    user.timeStatistics[i].year  == expenseDateObj.getFullYear()    ){

                    user.timeStatistics[i].count++;
                    user.timeStatistics[i].value += expense.value;

                    for (var j = 0; j<=user.timeStatistics[i].expenseTypes.length; j++){

                        // If this expense type does not exist
                        if( j == user.timeStatistics[i].expenseTypes.length ){
                            var newExpenseType = {
                                name:  expense.type,
                                count: 1.0,
                                value: expense.value
                            }
                           
                            user.timeStatistics[i].expenseTypes.push(newExpenseType);
                            break;
                        }

                        // If this expense type matches an existing expense type
                        if( user.timeStatistics[i].expenseTypes[j].name.replace(/\s+/g, '').toLowerCase() ==
                            expense.type.replace(/\s+/g, '').toLowerCase() ){

                            user.timeStatistics[i].expenseTypes[j].count++;
                            user.timeStatistics[i].expenseTypes[j].value += expense.value;
                            break;
                        }
                    }
                    break;
                }
            }

            user.save(function(err,updateduser){
                if(err){
                    callback("error saving an expense",null);
                }
                else{
                    callback(null, updateduser.expenses[updateduser.expenses.length -1]);
                }    
            });
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
                    totalExpenses:  user.totalExpenses,
                    timeStatistics: user.dailyExpenses,
                    types:          user.expenseTypes.sort(function(a,b){
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


    
}