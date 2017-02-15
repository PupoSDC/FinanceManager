// On Document ready
setdate(document.getElementById('expenseinputdate'));
getExpenses(function(expenses){
    console.log(expenses);
    drawCanvas(null);
    getStatistics();
});

// DOM manipulation functions
function templateExpense(expense){

    var div = document.createElement('div');
    div.setAttribute('class','expense');
    div.setAttribute('id',expense._id)

    var date = new Date(expense.date);

    var d = ("0" + date.getDate()   ).slice(-2);
    var m = ("0" + (date.getMonth()+1)).slice(-2);
    var y = date.getFullYear();     

    div.innerHTML = [
        '   <div class="date">',
        '       <div>' + d +'/' + m + '/' + y + '</div>',
        '       <input type="text"  value="'+ d +'/' + m + '/' + y + '" maxlength="10" class="hide">',
        '   </div >',
        '   <div class="value">', 
        '       <div>'+ expense.value.toFixed(2) + ' €</div>',
        '       <input class="hide" type="number" min="0.01" step="0.01" max="2500" value="'+ expense.value + '" >',
        '   </div>',
        '   <div  class="type">', 
        '       <div>'+ expense.type + '</div>',
        '       <input type="text" value="'+ expense.type + '" class="hide">',
        '   </div>',
        '   <div  class="description">',
        '       <div>'+ expense.description + '</div>',
        '       <input type="text" value="'+ expense.description + '" class="hide">',
        '   </div>',
        '   <div class="button">',
        '       <button class="edit"      onclick="editExpense(this)">Edit</button>',
        '       <button class="save hide" onclick="saveEditExpense(this)">save</button>',
        '   </div >'
    ].join("\n");

    return div; 
}

function setdate(element){
    
    if(!element){ return; }

    var date = new Date();

    var d = ("0" + date.getDate()     ).slice(-2);
    var m = ("0" + (date.getMonth()+1)).slice(-2);
    var y = date.getFullYear(); 

    element.value = d + '/' + m +'/' + y
}

function editExpense(element){
    
    var expense = element.parentElement.parentElement;

    for (var i = 0; i < expense.children.length; i++)
    {
        for (var j = 0; j < expense.children[i].children.length; j++)
        {
            expense.children[i].children[j].classList.toggle("hide");
        }
    }
}

// Canvas Functions
function drawCanvas(expenses){
    var ctx = document.getElementById("myCanvas");
    ctx.setAttribute("height",200)
    ctx.setAttribute("width",ctx.clientWidth)
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

// AJAX Functions
function getExpenses(callback){

    var request = new XMLHttpRequest;

    request.open("POST","/getexpenses",true);
    request.setRequestHeader("Content-type", "application/json");
    request.timeout = 200;

    request.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){

                var body = document.getElementById('expensestable');

                for (var i = body.children.length - 1; i > -1 ; i--)
                {
                    if( body.children[i].classList.contains('expense') )
                    {
                        body.removeChild(body.children[i]);
                    }
                }

                var expenses = JSON.parse(request.responseText);
                var docfrag  = document.createDocumentFragment();

                for (var i = 0; i < expenses.length; i++)
                {
                    docfrag.appendChild(templateExpense(expenses[i]));
                }
                body.appendChild(docfrag);

                callback(expenses);
            }
            else
            {
                console.log("An error has occured getting the expenses!")
            }
        }
    }

    request.send();
} 

function getStatistics(callback){

    var request = new XMLHttpRequest;

    request.open("POST","/getstatistics",true);
    request.setRequestHeader("Content-type", "application/json");
    request.timeout = 200;

    request.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){
                console.log(request.responseText)
            }
            else
            {
                console.log("An error has occured getting the statistics: " + request.responseText)
            }
        }
    }

    request.send();
} 

function saveNewExpense(){
    var date = document.getElementById('expenseinputdate').value;
    var d = date.split('/')[0];
    var m = date.split('/')[1];
    var y = date.split('/')[2];
    var dateobj     = new Date(y +"-" + m + "-" + d  ).toISOString();
    var value       = document.getElementById('expenseinputvalue').value;
    var type        = document.getElementById('expenseinputtype').value;
    var description = document.getElementById('expenseinputdesc').value;

    if ( value != '' & type != '' & description != '' & date != undefined & !isNaN(value) )
    {
        var request = new XMLHttpRequest;

        request.open('POST','/createexpense',true);
        request.setRequestHeader('Content-type', 'application/json');
        request.timeout = 200;

        request.send(JSON.stringify({
            value:       value, 
            date:        dateobj,
            type:        type,
            description: description
        }));

        request.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status == 200){
                    document.getElementById('expenseinputvalue').value = '';
                    document.getElementById('expenseinputtype').value  = '';
                    document.getElementById('expenseinputdesc').value  = '';
                    getExpenses();  
                }
                else
                {
                    console.log("Error saving document: " + request.responseText)
                }
            }
        }
    }
    else
    {
        console.log("Error parsing input")
    }
}

function saveEditExpense(element){
    
    var expense     = element.parentElement.parentElement;
    var _id         = expense.id;
    var date        = expense.getElementsByClassName("date")[0].getElementsByTagName("input")[0].value;
    var d           = date.split('/')[0];
    var m           = date.split('/')[1];
    var y           = date.split('/')[2];
    var dateobj     = new Date(y +"-" + m + "-" + d  ).toISOString();

    var value       = expense.getElementsByClassName("value")[0].getElementsByTagName("input")[0].value;
    var type        = expense.getElementsByClassName("type")[0].getElementsByTagName("input")[0].value;
    var description = expense.getElementsByClassName("description")[0].getElementsByTagName("input")[0].value;

    if ( value != '' & type != '' & description != '' )
    {
        var request = new XMLHttpRequest;

        request.open('POST','/updateexpense',true);
        request.setRequestHeader('Content-type', 'application/json');
        request.timeout = 500;

        request.send(JSON.stringify({
            _id:         _id,
            value:       value, 
            date:        dateobj,
            type:        type,
            description: description
        }));

        request.onreadystatechange = function(){
            if(this.readyState == 4){
                if(this.status == 200){
                    getExpenses(null);  
                }
                else
                {
                    console.log("Error saving edited document. " + request.responseText)
                }
            }
        }
    }
    else
    {
        console.log("error")
    }
}

function saveBackup(jsoninput){

    var request = new XMLHttpRequest;

    request.open('POST','/savebackup',true);
    request.setRequestHeader('Content-type', 'application/json');

    request.send(jsoninput);

    request.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){
                console.log( request.responseText + " documents saved!");
            }
            else
            {
                console.log("Error saving documents: " + request.responseText)
            }
        }
    }     
}