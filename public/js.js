

//Request all the expenses
function getExpenses(){

	var request = new XMLHttpRequest

	request.open("POST","/getexpenses",true);
 	request.setRequestHeader("Content-type", "application/json");
 	request.timeout = 200;

	request.onreadystatechange = function(){
		if(this.readyState == 4){
	  		if(this.status == 200){
	  			console.log(request.responseText)
	  		}
	  	}
	}

	request.send();
} 

function saveExpense(){
	var date        = new Date(document.getElementById("expenseinputdate").value).getTime();
	var value       = document.getElementById("expenseinputvalue").value;
	var type        = document.getElementById("expenseinputtype").value;
	var description = document.getElementById("expenseinputdesc").value;

	if ( value != '' & type != ''& description != '' )
	{
		var request     = new XMLHttpRequest

		request.open("POST","/createexpense",true);
	 	request.setRequestHeader("Content-type", "application/json");
	 	request.timeout = 200;

	 	request.send(JSON.stringify({
	 		value:       value, 
	 		date:        date,
	 		type:        type,
	 		description: description
	 	}));

	 	request.onreadystatechange = function(){
			if(this.readyState == 4){
		  		if(this.status == 200){
		  			console.log(request.responseText)
		  			document.getElementById('expenseinputdate').value  = new Date().toDateInputValue();
					document.getElementById("expenseinputvalue").value = 0.0;
					document.getElementById("expenseinputtype").value  = '';
					document.getElementById("expenseinputdesc").value  = '';	
		  		}
		  	}
		}
	}
	else
	{
		console.log("error")
	}


}

// Setting default date to today
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

document.getElementById('expenseinputdate').value = new Date().toDateInputValue();