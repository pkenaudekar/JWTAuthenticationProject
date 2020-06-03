const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const check = async(req, res, next) => {   
    try {
        const Token = req.cookies.Token.replace('Bearer ', '');
        const data = jwt.verify(Token, process.env.JWT_KEY);
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

module.exports = check;