

//Request all the expenses
function getExpenses(){

	var body    = document.getElementById('expensestable').getElementsByTagName('tbody')[0];

	for (var i = body.children.length - 1; i > -1 ; i--)
	{
		if( body.children[i].classList.contains('expense') )
		{
			body.removeChild(body.children[i]);
		}
	}

	var request = new XMLHttpRequest

	request.open("POST","/getexpenses",true);
 	request.setRequestHeader("Content-type", "application/json");
 	request.timeout = 200;

	request.onreadystatechange = function(){
		if(this.readyState == 4){
	  		if(this.status == 200){
	  			printExpenses(body,JSON.parse(request.responseText));
	  		}
	  	}
	}

	request.send();
} 

function saveExpense(){
	
	var date        = new Date(document.getElementById('expenseinputdate').value).getTime();
	var value       = document.getElementById('expenseinputvalue').value;
	var type        = document.getElementById('expenseinputtype').value;
	var description = document.getElementById('expenseinputdesc').value;

	if ( value != '' & type != ''& description != '' )
	{
		var request     = new XMLHttpRequest

		request.open('POST','/createexpense',true);
	 	request.setRequestHeader('Content-type', 'application/json');
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
					document.getElementById('expenseinputvalue').value = 0.0;
					document.getElementById('expenseinputtype').value  = '';
					document.getElementById('expenseinputdesc').value  = '';
					getExpenses();	
		  		}
		  	}
		}
	}
	else
	{
		console.log("error")
	}
}

function printExpenses(body,expenses){

	var docfrag    = document.createDocumentFragment();

	for (var i = 0; i < expenses.length; i++)
	{
		var expense = document.createElement('tr');
		expense.setAttribute('class','expense');	

		var celldate  = document.createElement('td');
		var cellvalu  = document.createElement('td');
		var celltype  = document.createElement('td');
		var celldesc  = document.createElement('td');
		var cellbutt  = document.createElement('td');
		var button    = document.createElement('button')

		celldate.setAttribute('class','date');
		cellvalu.setAttribute('class','value');
		celltype.setAttribute('class','type');
		celldesc.setAttribute('class','description');
		cellbutt.setAttribute('class','editbutton')

		var date = new Date(expenses[i].date);
		
		var d = date.getDate();
		var m = date.getMonth()+1;
		var y = date.getFullYear();   	

		celldate.innerHTML = d +'/' + m + '/' + y;
		cellvalu.innerHTML = expenses[i].value.toFixed(2) + ' €';
		celltype.innerHTML = expenses[i].type;
		celldesc.innerHTML = expenses[i].description;

		button.setAttribute('class','edit')
		button.setAttribute('onclick','editexpense()')
		button.innerHTML = 'Edit';
		cellbutt.appendChild(button);

		expense.appendChild(celldate);
		expense.appendChild(cellvalu);
		expense.appendChild(celltype);
		expense.appendChild(celldesc);
		expense.appendChild(cellbutt);

		docfrag.appendChild(expense);
		body.appendChild(docfrag);
	}
}

// Setting default date to today
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});


// ON DOCUMENT READY!
document.getElementById('expenseinputdate').value = new Date().toDateInputValue();
getExpenses();