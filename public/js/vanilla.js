function showDetails(){
    $.ajax({
        url:'/accounts/all',
        type: 'POST',
        dataType: 'json',
        success: function(account) {
            account.forEach(doc => {
                const html = `
                <tr>
                    <td>${doc.Username}</td>
                    <td>${doc.Password}</td>
                    <td>${doc.Name}</td>
                    <td>${doc.Age}</td>
                    <td><input type="submit" class="button" value="Update" name="update" onclick="fetch('${doc._id}')"></td>
                    <td><input type="submit" class="button" value="Delete" onclick="del('${doc._id}')"></td>
                </tr>`;
                document.querySelector("tbody").insertAdjacentHTML('afterend', html); 
            });            
        },
        error: function(account) {
            window.location.assign("index.html");
        }
    });
}

function check(){
    $.ajax({
        url:'/accounts/login/check',
        type: 'POST',
        dataType: 'text',
        success: function (data, textStatus, request) {
            //window.location.assign("registration.html");  
        },              
        error: function (data, textStatus, request) {
            console.log("Error: "+JSON.stringify(data));
            window.location.assign("index.html");
        }
    });
    return true;
}

function reset(){
    document.cookie = "Token=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    localStorage.removeItem("DocId"); 
    localStorage.removeItem("Token");
}
//var access_token;

$(function () {
    $('form#login').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/accounts/login',           
            data: $('form').serialize(),
            success: function (data, textStatus, request) {
               console.log("Response: "+data);
               console.log("textStatus: "+textStatus);
                if(data!="False") {
                    $('form')[0].reset();                    
                    console.log("Login Successful");
                    //access_token = request.getResponseHeader('Authorization');     
                    //alert("Login Successful");
                    //alert("Access_token "+ access_token);                
                    console.log("Authorization "+request.getResponseHeader('Authorization'));
                    //let headers = new Headers({'Content-Type': 'application/json'});  
                    //headers.append('Authorization',request.getResponseHeader('Authorization')).location.href = "registration.html";
                    //window.location.href = "registration.html"; 
                    //setcookie('Token',request.getResponseHeader('Authorization'), { httpOnly: true });                        
                    document.cookie = "Token="+request.getResponseHeader('Authorization');
                    localStorage.setItem("Token", request.getResponseHeader('Authorization'));                
                    window.location.assign("registration.html"); 
                    check();                                                                   
                }
                else
                {
                    $('form')[0].reset(); 
                    console.log("Login failed! Check authentication credentials");
                    alert("Login failed! Check authentication credentials");                    
                }        
            },
            error: function(data, textStatus, request) {
                window.location.assign("index.html");
            }
        });
        return false;
    });
});


function del(_id){
    //console.log("id "+_id);
    $.ajax({
        type: 'DELETE',
        url: '/accounts/me/delete/'+_id,           
        success: function (data, textStatus, request) {
           console.log("Response: "+JSON.stringify(data));
           console.log("textStatus: "+textStatus);   
           console.log("Request: "+JSON.stringify(request)); 
           alert("Record deleted successfully");
           window.location.reload();        
        },
        error: function(data, textStatus, request) { 
           console.log("Response: "+JSON.stringify(data));
           console.log("textStatus: "+textStatus);   
           console.log("Request: "+JSON.stringify(request));
           alert(JSON.stringify(data.responseText));  
        }         
    });
    return false;
}   

function fetch(_id){    
    //console.log("id "+_id);
    document.getElementById("myForm").style.display = "block";
    $.ajax({
        type: 'POST',
        url: '/accounts/me/fetch/'+_id,           
        success: function (data, textStatus, request) {
           console.log("Response: "+JSON.stringify(data));
           console.log("textStatus: "+textStatus);   
           console.log("Request: "+JSON.stringify(request));
           console.log("DataId "+data._id);           
           $('#modUsername').val(data.Username);
           $('#modName').val(data.Name);
           $('#modAge').val(data.Age);  
           localStorage.setItem("DocId", data._id);                      
           
        },
        error: function(data, textStatus, request) { 
           console.log("Response: "+JSON.stringify(data));
           console.log("textStatus: "+textStatus);   
           console.log("Request: "+JSON.stringify(request));
           alert(JSON.stringify(data.responseText));  
        }         
    });
    return false;
}   

function update(){ 
        var _id=localStorage.DocId;
        console.log("DocId In LocalStorage "+_id);
        $.ajax({
            type: 'PUT',
            url: '/accounts/me/update/'+_id,           
            data: $('form').serialize(),
            success: function (data, textStatus, request) {
                console.log("Response: "+JSON.stringify(data));
                console.log("textStatus: "+textStatus);   
                console.log("Request: "+JSON.stringify(request)); 
                alert("Record updated successfully");
                localStorage.removeItem("DocId");
                window.location.reload();                                               
            },
            error: function(data, textStatus, request) { 
               console.log("Response: "+JSON.stringify(data));
               console.log("textStatus: "+textStatus);   
               console.log("Request: "+JSON.stringify(request));
               alert(JSON.stringify(data.responseText));  
            }         
        });
        return false;    
}

$(function () {
    $('form#details').on('submit', function (e) {
        e.preventDefault();
        $.ajax({            
            success: function () {                            
                    window.location.assign("details.html");                               
            }
        });
        return false;
    });
});

$(function () {
    $('form#logout').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/account/me/logout',           
            data: $('form').serialize(),
            success: function (data, textStatus, request) {
               console.log("Response: "+data);
               console.log("textStatus: "+textStatus);
                if(data!="False") {
                    $('form')[0].reset();                    
                    console.log("Logout Successful");        
                    document.cookie = "Token=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
                    localStorage.removeItem("DocId"); 
                    localStorage.removeItem("Token");                
                    window.location.assign("index.html");                                                
                }
                else
                {
                    $('form')[0].reset(); 
                    console.log("Login failed! Check authentication credentials");
                    alert("Login failed! Check authentication credentials");                    
                }        
            }
        });
        return false;
    });
});

$(function () {
    $('form#logoutall').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/account/me/logoutall',           
            data: $('form').serialize(),                      
            success: function (data, textStatus, request) {
               console.log("Response: "+data);
               console.log("textStatus: "+textStatus);
                if(data!="False") {
                    $('form')[0].reset();                    
                    console.log("Logout Successful");        
                    document.cookie = "Token=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";  
                    localStorage.removeItem("DocId"); 
                    localStorage.removeItem("Token");                
                    window.location.assign("index.html");                                                
                }
                else
                {
                    $('form')[0].reset(); 
                    console.log("Login failed! Check authentication credentials");
                    alert("Login failed! Check authentication credentials");                    
                }        
            }
        });
        return false;
    });
});

function closeForm() {
    localStorage.removeItem("DocId");
    document.getElementById("myForm").style.display = "none";    
  }