// On Document ready
setdate(document.getElementById('expenseinputdate'));
getExpenses(function(response){
    var expenses   = response.expenses;
    var statistics = response.statistics;

    console.log(statistics)

    var data = {
        labels: [],
        datasets: [{
            label: "Type of expenses",
            data:  []
        }]
    }

    for (var i = 0; i < statistics.types.length, i < 8; i++)
    {
        if(i>5){break;}
        data.labels.push(statistics.types[i].name);
        data.datasets[0].data.push(statistics.types[i].count);
    }

    drawCanvas(data);
});


// DOM manipulation functions
function templateExpense(expense){

    var div  = document.createElement('div');

    div.setAttribute('class','expense');
    div.setAttribute('id',expense._id)

    var date = new Date(expense.date);

    var d = ("0" + date.getDate()   ).slice(-2);
    var m = ("0" + (date.getMonth()+1)).slice(-2);
    var y = date.getFullYear();     

    div.innerHTML = [
        ' <div class="">',
        '   <div class="value">', 
        '       <div>'+ expense.value.toFixed(2) + '</div>',
        '       <input class="hide" type="number" min="0.01" step="0.01" max="2500" value="'+ expense.value.toFixed(2) + '" >',
        '       <div>&nbsp€</div><div style="color: #ddd;" class="hide">&nbsp€</div>',
        '   </div>',
        '   <div class="date">',
        '       <div>' + d +'/' + m + '/' + y + '</div>',
        '       <input type="text"  value="'+ d +'/' + m + '/' + y + '" maxlength="10" class="hide">',
        '   </div >',

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
        '   </div >',
        ' </div>'
    ].join("\n");

    return div; 
}

function replaceExpense(expense){

    var expensediv   = document.getElementById(expense._id);
    var parent       = document.getElementById('expensestable');
    var index        = Array.prototype.indexOf.call(parent.children, expensediv);
    parent.removeChild(parent.children[index]);

    parent.insertBefore(templateExpense(expense), parent.children[index]);
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

function applyColourGrading(statistics){
}

// Canvas Functions
function drawCanvas(data){
    var ctx = document.getElementById("myCanvas");
    ctx.setAttribute("height",ctx.clientHeight)
    ctx.setAttribute("width",ctx.clientWidth)
    var myChart = new Chart(ctx, {
        type:   'bar',
        data:    data,
        options: { 
            scales: { 
                yAxes: [{ ticks: { beginAtZero:true } }] 
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
                    if( body.children[i].classList.contains('expense') && body.children[i].id != "expenseinput" )
                    {
                        body.removeChild(body.children[i]);
                    }
                }

                var expenses   = JSON.parse(request.responseText).expenses;
                var statistics = JSON.parse(request.responseText).statistics;
                var docfrag    = document.createDocumentFragment();

                for (var i = 0; i < expenses.length; i++)
                {
                    docfrag.appendChild(templateExpense(expenses[i]));
                }
                body.appendChild(docfrag);

                callback(JSON.parse(request.responseText));
            }
            else
            {
                console.log("An error has occured getting the expenses: " + request.responseText + "!")
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
                    document.getElementById('expenseinputvalue').value = '0.00';
                    document.getElementById('expenseinputtype').value  = 'Type';
                    document.getElementById('expenseinputdesc').value  = 'description';
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
    
    var expense     = element.parentElement.parentElement.parentElement;
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
                    replaceExpense(JSON.parse(request.responseText));  
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