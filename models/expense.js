var mongoose = require('mongoose');

var ExpenseSchema = mongoose.Schema({                                 // Expense Schema
   
    date:        { type: Date,   required: true, default: Date.now() },   // Date the photo was created (automatic)
    value:       { type: Number, required: true },                        // Value of the expense
    type:        { type: String, required: true },                        // Type of the expense
    description: { type: String                 }                         // Generated on photo request

});

var Expense = module.exports = mongoose.model('Expense', ExpenseSchema);

module.exports = {

    createExpense:  function(date, value, type, description, callback){         // Creates a new Broadcast

                        var newExpense = new Expense;                              // Create new Broadcast
    
                        if (date != '')
                        {
                        	newExpense.date          = date;                         // Store date provided or default
                        } 

       					newExpense.value             = value;                        // Store the value of the expense
       					newExpense.type              = type;                         // Store the type of expense
       					newExpense.description       = description;                  // Store the expesne description (optional)

       					newExpense.save(function(err,expense,numAffected){           // Saves expense in DB
                                    if(err) { return callback(err,null)         }        // If error callback with error
                                    else    { return callback(null,expense._Id) }        // Else callback with null     
                            });                     
                    },

    getExpenses:    function(callback){
    					Expense.find({})
                               .select({date:1, value:1, type:1, description:1, _id: 0})
                               .sort({date: -1}) 
                               .exec(callback);
    				}  
}