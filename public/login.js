// User management functions
function loginUser(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;   

    var request = new XMLHttpRequest;

    request.open('POST','/login',true);
    request.setRequestHeader('Content-type', 'application/json');

    request.send(JSON.stringify({
        username:      username, 
        password:      password,
    }));

    request.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){ location.reload() }
            else                  { console.log(request.responseText)}
        }
    }
}

function registerUser(){
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;   

    var request = new XMLHttpRequest;

    request.open('POST','/register',true);
    request.setRequestHeader('Content-type', 'application/json');

    request.send(JSON.stringify({
        username:      username, 
        password:      password,
    }));

    request.onreadystatechange = function(){
        if(this.readyState == 4){
            if(this.status == 200){ location.reload() }
            else                  { console.log(request.responseText)}
        }
    }
}