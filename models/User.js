var mongoose  = require('mongoose'); // mongoose
var bcrypt    = require('bcryptjs'); // bcrypt, used to hash passwords

var Expense = mongoose.Schema({                                 // Expense Schema
    date:        { type: Date,   required: true, default: Date.now() },   // Date of the expense
    value:       { type: Number, required: true },                        // Value of the expense
    type:        { type: String, required: true },                        // Type of the expense
    description: { type: String                 }                         // Generated on photo request
});

var UserSchema = mongoose.Schema({                                 // Expense Schema
    username:    { type: String,  required: true, unique: true },         // Username
    password:    { type: String,  required: true    },                    // Hashed Password
    expenses:    [Expense],
    statistics:  []
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports = {

    createUser:         
    function(username,password,callback){                          
        bcrypt.hash(password, 10, function(err, hash) {               // Hashes the password
            if(err){ return callback(err,null) }                         // If error return callback null
            var newUser = new User({                                     // Creates new user
                username: username,                                         // Username
                password: hash                                              // Password
            });                     
            newUser.save(function(err,user,numAffected){              // Save new user and callbacks
                if(err){ return callback(err,null) }                            // If error return callback null
                else   { return callback(null,user._Id) }                       // Else return user.id
            });                                   
        });
    },

    getUserByUsername:  
    function(username,callback){                                   
        User.findOne({username: username})                             // Find by username
            .select('-password')                                       // Seclect everything but password
            .exec(function(err,user){                                  // Excute query
                if(err){ return callback(err,null)}                    // If error callback null
                else   { return callback(null,user)}                   // Else callback with user (user may be null!)
            })                                           
    },
    
    comparePassword:    
    function(username,candidatePassword,callback){                 
       User.findOne({username: username})                              // Find user by username
           .select('password')                                         // Select's only the password + developer status
           .exec(function(err,user){                                   // Executes query
                if(err || !user) { return callback(false, null) }          // If error return "false"       
                bcrypt.compare(candidatePassword, user.password,           // Compares user password with candidate password
                    function(err, isMatch) {                                   // isMatch = result from the compare (true || false)
                        if(err)     { return callback(err ,false,null);    }      // If error throw error 
                        if(!isMatch){ return callback(null,false,null);    }      // If no match, return false an no user  
                        else        { return callback(null,true,user);     }      // Else return true and a user id            
                    }
                );
        });
    }, 

    getUserById:        
    function(iduser,callback){                                     
        User.findById(iduser)                                          // Find by Id
            .select('-password')                                       // Select everything but password
            .exec(function(err,user){                                  // Execute query
                if(err) { return callback(err,null)}                   // If error callback with null
                else    { return callback(err,user)}                   // Else callback with user (user may be null!)
            });                                         
    },  

    createExpense:  
    function(userID,expense,callback){                             
        User.findById(userID,function(err,user){                      // Get user
            if(err) { return callback(err, null) }                        // If error, return

            if (expense.date == ''){ date = Date.now(); }                 // Default date to now if no date provided
            
            if(!expense.type || !expense.value )
            {
                return callback('Incomplete information!',null); 
            }

            var newExpense = {
                date        : expense.date,                               // Store date provided or default
                value       : expense.value,                              // Store the value of the expense
                type        : expense.type,                               // Store the type of expense
                description : expense.description                         // Store the expesne description (optional)
            }                                                       
            user.expenses.push(newExpense);
            user.save(callback(user.expenses[user.expenses.length -1]));
        });                
    },
     
    getExpenses:    
    function(userID,callback){                                     
        User.findById(userID,function(err,user){                 
            if(err) { return callback(err, null) }                         
            else    { callback(null,user.expenses)    }
        });
    },

    updateExpense: 
    function(userID,expenseinput,callback){                        
        User.findById(userID,function(err,user){                 
            if(err)                   { return callback(err, null) } 
            if(!user.expenses.id(_id)){ return callback("Expense not found",null); }

            if(!expense.type || !expense.value || !expense._id || !expense.date){
                return callback('Incomplete information!',null); 
            }

            user.expenses.id(_id).value       = expenseinput.value;
            user.expenses.id(_id).type        = expenseinput.type;
            user.expenses.id(_id).description = expenseinput.description;
            user.expenses.id(_id).date        = expenseinput.date;

            user.save(callback(null,user.expenses.id(_id)));
        });
    } 
    
}