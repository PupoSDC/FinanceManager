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
    res.send("oh hi");
});

router.post('/createexpense', function(req,res){
    
    var value        = req.body.value;
    var date         = req.body.date;           
    var type         = req.body.type;    
    var description  = req.body.description;

    if(!date)          { date = Date.now();                    }
    if(!type || !value){ return res.send('No value or type!'); }

    Expense.createexpense(date, value, type, description, 
        function(err, id) {
            if(err){ return res.send("Error adding to DB!") }
            else   { return res.send(id);                   }
        }
    );

});

router.post('/readexpensesbackup', function(req,res){
    
    var parsedJSON        = req.body.value;
    // Read JSON with backup

});

router.post('/getexpenses', function(req,res){
    
    Expense.getexpenses(function(err, expenses) {
            if(err){ return res.send("Error accessing to DB!") }
            else   { return res.send(expenses);                   }
        }
    );

});


/////////////////////////////////////////////////////////////
//// EXPORT ROUTER //////////////////////////////////////////
/////////////////////////////////////////////////////////////
module.exports = router;