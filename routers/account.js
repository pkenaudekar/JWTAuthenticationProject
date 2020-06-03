const express = require("express");
const Account = require("../models/Account");
const auth = require('../middleware/auth');
const check = require('../middleware/check');
const router = express.Router();
var JSAlert = require("js-alert");
const axios = require('axios');

router.post('/accounts', async (req, res) => {
    // Create a new account
    try {
        const account = new Account(req.body);
        await account.save();
        const Token = await account.generateAuthToken();
        res.status(201).send('<script>window.location.href="../details.html";</script>');
        //res.status(201).redirect("/details.html");
    } catch (error) {
        res.status(400).send(error);
    }
});

/*
router.post('/setheader', async (req, res) => {
    // Set page header
    try {
        const Token = req.header('Authorization');
        console.log("headval "+Token);
        res.status(200).header('Authorization', Token);
    } catch (error) {
        res.status(400).send(error);
    }
});*/


router.post('/accounts/login', async(req, res) => {
    //Login a registered account
    try {
        const { Username, Password } = req.body;
        const account = await Account.findByCredentials(Username, Password);
        if (!account) {
            console.log("Error account"+account); 
            return res.send("False").status(401);
            //res.status(401).redirect("/index.html");
        }
        const Token = await account.generateAuthToken();                      
        //console.log(Token);
        //res.send({ Token });
        //res.send({ account, Token });
        //res.send({ account, Token }).header('Authorization', 'Bearer '+Token).status(200).redirect("/registration.html");        
        
        //Sending Authorisation token in the header and redirecting to registration.html page
        //res.header('Authorization', 'Bearer '+Token); 
        //res.set('Authorization', 'Bearer '+Token).status(200).redirect("/registration.html");
        //res.status(200).redirect("/registration.html").send({ account, Token });
        //res.status(200).redirect("/registration.html").json({ account, Token });
        //res.cookie('Token',Token, { httpOnly: true }).send('<script>window.location.href="../registration.html";</script>').status(200);
        //localStorage.setItem('Token', Token);
        //res.status(200).send("True");
        //res.status(200).send(Token);
        res.status(200).header('Authorization', 'Bearer '+Token).send("True");
        //res.cookie('Token',Token, { httpOnly: true }).status(200).send("True");
                 
    } catch (error) {    
        //console.log("Error"+error);    
        res.send("False").status(400);
        //res.status(400).redirect("/index.html");         
    }
});

/*
router.get('/accounts/me', auth, async(req, res) => {
    // View logged in account profile
    res.send(req.account);
});
*/

router.post('/accounts/login/check',check, async(req, res) => {
    // View logged in account profile
    res.send("True");      
});

/* We filter the user’s tokens array and return true if any of the tokens is not equal to the token that was used by 
the user to login. The array filter method creates a new array with all elements that pass the test implemented. 
The filter method will return a new array that contains any other tokens apart from the one that was used to log in. 
If we, therefore, try to get the user profile, we should be denied access since we are no longer logged in. */

router.post('/account/me/logout', auth, async(req, res) =>{
    // Logout user from the application
    try{
        //req.account.Tokens = req.account.Tokens.filter((Token) =>{           
        req.account.Tokens = req.account.Tokens.filter((Token) =>{ 
            return Token.Token != req.Token;
        });
        await req.account.save(); 
        //res.status(200).send('<script>window.location.href="../index.html";</script>').clearCookie('Token');
        res.status(200).header('Authorization', req.header('Authorization')).send("True");
        //res.status(200).redirect("/index.html").clearCookie('Token');
    }catch(error){
        //res.status(500).send(error);
        res.send("False").status(500);
    }
});

/* we use the splice array method to remove tokens from the accounts tokens array. We then save the user document.  */
router.post('/account/me/logoutall', auth, async(req, res) =>{
    // Logout user from all devices
    try{
        req.account.Tokens.splice(0, req.account.Tokens.length);
        await req.account.save();
        //res.send();
        //res.status(200).send('<script>window.location.href="/index.html";</script>').clearCookie('Token');
        res.status(200).header('Authorization', req.header('Authorization')).send("True");
    }catch(error){
        res.status(500).send(error);
    }
});


router.post('/accounts/all', check, async(req, res) => {
    // View all account profile   `
    try{
        var account = await Account.find();
        if (!account) {
            res.status(401).send(error);
        }
        res.json(account);            
    } catch (error) {        
        //res.status(400).send(error);
        //console.log("Error ",error);
        res.status(400);         
    }    
});

router.delete('/accounts/me/delete/:_id', auth, async (req,res) => {
    console.log("id "+req.params._id);
    const  id = req.params._id;
    const documentCount = await Account.countDocuments({});
    console.log( "Number of accounts:", documentCount );
    if(documentCount > 1)
    {
        try{
            var account = await Account.findAndRemove(id);
            if (!account) {
                res.status(401).send(error);
            }
            res.json(account);            
        } catch (error) {        
            //res.status(400).send(error);
            console.log("Error ",error);
            res.status(400);         
        }   
    }
    else{
        res.status(412).send('Require atleast 1 account to be present');
    }
    
});

router.put('/accounts/me/update/:_id', auth, async (req,res) => {
    console.log("id "+req.params._id);
    //modal.style.display = "block";
    const  id = req.params._id;
    const { Username, Password, Name, Age } = req.body;
    try{
        var account = await Account.findAndModify(id, Username, Password, Name, Age);
        if (!account) {
            res.status(401).send(error);
        }
        res.json(account);            
    } catch (error) {        
        //res.status(400).send(error);
        console.log("Error ",error);
        res.status(400);         
    }    
});

router.post('/accounts/me/fetch/:_id', auth, async (req,res) => {
    console.log("id "+req.params._id);
    //modal.style.display = "block";
    const  id = req.params._id;
    try{
        var account = await Account.findByUsingId(id);
        if (!account) {
            res.status(401).send(error);
        }
        res.json(account);            
    } catch (error) {       
        res.status(400);         
    }       
});
module.exports = router;
