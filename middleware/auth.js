const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const auth = async(req, res, next) => {
    /* We get the token from the request header and since the token comes in a format of, Bearer[space]token we are 
    replacing Bearer[space] with nothing('') so that we can have access to our token. */
     
    //const Token = req.header('Authorization').replace('Bearer ', '');
    
    //console.log('Cookie '+req.cookies['Token']);
    const Token = req.cookies.Token.replace('Bearer ', '');
    //const Token = window.localStorage.getItem("Token").replace('Bearer ', '');
    //console.log('Token: '+req.cookies['Token']);
    /* Once we have the token, we use the JWT verify method to check if the token received is valid or was created 
    using our JWT_KEY . The JWT verify method returns the payload that was used to create the token. Now since we 
    have the payload from the token, we can now find a account with that id and also if the token is in the account's tokens 
    array. Once we find that account, we attach the account on our request (req.account = account) and then do the same for the 
    token then call next() to go to the next middleware. If next() is not called, the application will freeze at that 
    point and won’t proceed to run the rest of the code. */
    const data = jwt.verify(Token, process.env.JWT_KEY);
    try {
        const account = await Account.findOne({ _id: data._id, 'Tokens.Token': Token });
        if (!account) {
            throw new Error();
        }
        req.account = account;
        req.Token = Token;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' });        
    }
};

module.exports = auth;