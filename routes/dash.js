var path          = require('path');
var formidable    = require('formidable');
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
            if(err){ return res.send("Error adding to DB!") }
            else   { return res.send(id);                   }
        }
    );

});

router.post('/readexpensesbackup', function(req,res){

 // curl -H "Content-Type: application/json" -X POST -d "[{"date":1486073906770,"value":66.42,"type":"Bank","description":"settling debt"}
    var parsedJSON = JSON.parse(req.body.value);

    for (var i = 0; i < parsedJSON.length; i++)
    {
        Expense.createExpense(
            parsedJSON[i].value,
            parsedJSON[i].date,
            parsedJSON[i].type,
            parsedJSON[i].description,
            function(err,id){
                if(err){ console.log("Error adding backup!"); }
                else   { console.log("Added record " + i);    }
            }
        );
    }

});

router.post('/getexpenses', function(req,res){
    
    Expense.getExpenses(function(err, expenses) {
            if(err){ return res.send("Error accessing to DB!"); }
            else   { return res.send(expenses);                 }
        }
    );

});


/////////////////////////////////////////////////////////////
//// EXPORT ROUTER //////////////////////////////////////////
/////////////////////////////////////////////////////////////
module.exports = router;