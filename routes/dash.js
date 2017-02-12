var path          = require('path');
var router        = require('express').Router();     
var Expense       = require('../models/expense');  // Broadcast mongoose schema and operators


/*
  /////////////////////////////////////////////////////////////
  ///// USER INPUTS (POSTS) ///////////////////////////////////
  /////////////////////////////////////////////////////////////
  //
  // /hi          - says hi back :)
  //
  /////////////////////////////////////////////////////////////
  //// SERVER OUTPUS //////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
*/


/////////////////////////////////////////////////////////////
///// USER INPUTS (POSTS) ///////////////////////////////////
/////////////////////////////////////////////////////////////

// Logout - Executes user logout
router.post('/hi', function(req, res){
    return res.send("oh hi");
});

router.post('/createexpense', function(req,res){
    
    var value        = req.body.value;
    var date         = req.body.date;           
    var type         = req.body.type;    
    var description  = req.body.description;

    if(!date)          { date = Date.now();                    }
    if(!type || !value){ return res.send('No value or type!'); }

    Expense.createExpense(date, value, type, description, 
        function(err, id) {
            if(err){ return res.send(err) }
            else   { return res.send(id); }
        }
    );
});

router.post('/getexpenses', function(req,res){ 
    Expense.getExpenses(function(err, expenses) {
            if(err){ return res.send("Error accessing to DB!"); }
            else   { return res.send(expenses);                 }
        }
    );
});

router.post('/updateexpense', function(req,res){ 

    var expense = {
        _id          : req.body._id,
        value        : req.body.value,
        date         : req.body.date,           
        type         : req.body.type,    
        description  : req.body.description
    }

    if(!expense.type || !expense.value || !expense._id || !expense.date){
        return res.status(500).send('Incomplete information!'); 
    }

    Expense.updateExpense(expense,function(err, expense) {
        if(err){ return res.status(500).send(err); }  
        else   { return res.send(expense);         }
    });
});



/////////////////////////////////////////////////////////////
//// EXPORT ROUTER //////////////////////////////////////////
/////////////////////////////////////////////////////////////
module.exports = router;