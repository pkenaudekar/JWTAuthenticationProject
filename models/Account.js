// we load in the required packages
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

/* we create our mongoose schema which takes in an object.This object defines the 
different properties of the user schema. Mongoose will convert our user schema 
into a document in the database and those properties will be converted into fields 
in our document. */
const accountSchema = new mongoose.Schema({
    Username: {
        type: String,   //Of the type string
        required: true, //Can't be empty
        unique: true,   //Value needs to be unique
        trim: true      //Removes spaces from beginning and end
    },
    Password: {
        type: String,
        required: true,
        trim: true
    },
    Name: {
        type: String,
        required: true,
        trim: true,
        /* The validate function helps us make some more validations on our schemas. 
        We are using the validator package to easily define validations that would 
        have taken us many lines of code to write. */        
    },
    Age: {
        type: String,
        required: true,
        trim: true,
        validate: value => {
            if (!validator.isInt(value)) {
                throw new Error({error: 'Invalid Age field'});
            }
        }
    },
    Tokens: [{
        Token: {
            type: String,
            required: true
        }
    }]
});


/* We shall also store a list of tokens in our database. Every time a user registers or 
logs in, we shall create a token and append it to the existing list of tokens. Having a 
list of tokens enables a user to be logged in on different devices and once they log out 
of one device, we still want to make sure that they are still logged in on another device 
that they had logged in. 
we define a pre-save function that the mongoose schema provides us. This enables us to do 
something before we save the created object. As you can see, we are trying to hash the 
password before saving the object. Ideally, you shouldn’t be saving passwords in a raw format.
They should be properly hashed. We are using bcrypt to hash the password. We want to make 
sure that we only hash the password if it’s modified and that’s why we have to first check if 
the password was modified.*/

accountSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const account = this;
    if (account.isModified('Password')) {
        account.Password = await bcrypt.hash(account.Password, 8);
    }
    next();
});

/* Mongoose also enables us to define both instance and model methods. Model methods are methods 
defined on the model and can be created by using the schema statics whereas instance methods just
like their name suggests are defined on the document/instance. From, line 78 to 85 ,we define an instance method called 
generateAuthToken . This method uses the JWT to sign method to create a token. The sign method expects 
the data that will be used to sign the token and a JWT key which can be a random string. For our case, 
we defined one in the .env file and named it JWT_KEY . Once the token is created, we add it to the user’s 
list of tokens, save, and return the token. */

accountSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the account
    const account = this;
    const Token = jwt.sign({_id: account._id}, process.env.JWT_KEY);
    account.Tokens = account.Tokens.concat({Token});
    await account.save();
    return Token;
};

/* We define a model method called findByCredentials which expects two parameters, the account Username, and Password. 
on, line 93 we search for a account with the given username using the mongoose find method. If the account is not available, 
we throw an error to let the account know that the credentials they provided are invalid. If the Username exists, we then 
compare the received password with the stored hashed password and if they match, we return that account. We shall use 
this function to log account into the application.*/

accountSchema.statics.findByCredentials = async (Username, Password) => {
    // Search for a account by Username and Password.
    const account = await Account.findOne({Username});
    
    if (!account) {
        throw new Error({ error: 'Invalid login credentials' });
    }
    const isPasswordMatch = await bcrypt.compare(Password, account.Password);
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' });
    }
    return account;
};
 
accountSchema.static.find = async function() {
    // Search for all account in database    
    await Account.find({}, { projection: { _id: 1, Username: 1, Password: 1, Name: 1, Age: 1, Tokens: 0 } }).toArray(function(err, account){
        if (!account) {
            throw new Error({ error: 'No Data found' });
        } 
        res.json(account);
        return account;     
    });       
};

accountSchema.statics.findAndRemove = async function(id) {
    // Search for a account by Username and Password.
    console.log("findbyid "+id);
    const account = await Account.findByIdAndRemove(id);    
    if (!account) {
        throw new Error({ error: 'No Data found' });
    }
    // res.json(account);  
    return account;
};

accountSchema.statics.findByUsingId = async function(id) {
    // Search for a account by Username and Password.
    console.log("findbyid "+id);
    var account = await Account.findById(id);
    console.log("Account "+account);
    /*
    account = await Account.findByIdAndUpdate({_id: req.params.id},
        {
            Username: req.body.username,
            Password: req.body.age,
            Name: req.body.name,
            Age: req.body.age,
        }); */   
    if (!account) {
        throw new Error({ error: 'No Data found' });
    }
    // res.json(account);  
    return account;  
};

accountSchema.statics.findAndModify = async function(id, Username, Password, Name, Age) {
    console.log("FindAndMofify id "+id);
    console.log("FindAndMofify Username "+Username);
    console.log("FindAndMofify Password "+Password);
    console.log("FindAndMofify Name "+Name);
    console.log("FindAndMofify Age "+Age);
    var data;

    if(Username && Username.trim())
    {
        console.log("Username has changed");
        if(Password && Password.trim())    
        {
            console.log("Password has changed");
            if(Name && Name.trim())    
            {
                console.log("Name has changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {
                        Username: Username,
                        Password: await bcrypt.hash(Password, 8),
                        Name: Name,
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {
                        Username: Username,
                        Password: await bcrypt.hash(Password, 8),
                        Name: Name,                       
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }                
            }
            else{
                console.log("Name has not changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {
                        Username: Username,
                        Password: await bcrypt.hash(Password, 8),                        
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {
                        Username: Username,
                        Password: await bcrypt.hash(Password, 8),                        
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }            
            }
        }
        else{
            console.log("Password not changed"); 
            if(Name && Name.trim())    
            {
                console.log("Name has changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {
                        Username: Username,                        
                        Name: Name,
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {
                        Username: Username,                        
                        Name: Name,                        
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }                
            }
            else{
                console.log("Name has not changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {
                        Username: Username,                        
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {
                        Username: Username,                        
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }            
            }
        }
    }
    else{
        console.log("Username not changed");
        if(Password && Password.trim())    
        {
            console.log("Password has changed");
            if(Name && Name.trim())    
            {
                console.log("Name has changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {                       
                        Password: await bcrypt.hash(Password, 8),
                        Name: Name,
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {
                        Username: Username,
                        Password: await bcrypt.hash(Password, 8),
                        Name: Name,                       
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }                
            }
            else{
                console.log("Name has not changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {                        
                        Password: await bcrypt.hash(Password, 8),                        
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {                        
                        Password: await bcrypt.hash(Password, 8),          
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }            
            }
        }
        else{
            console.log("Password not changed"); 
            if(Name && Name.trim())    
            {
                console.log("Name has changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {                        
                        Name: Name,
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");
                    data = {               
                        Name: Name,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }                
            }
            else{
                console.log("Name has not changed");
                if(Age && Age.trim())    
                {
                    console.log("Age has changed");
                    data = {
                        Age: Age,
                    };
                    account = await Account.findByIdAndUpdate({_id: id},data);
                }
                else{
                    console.log("Age not changed");                   
                }            
            }
        }
    }    
    if (!account) {
        throw new Error({ error: 'No Data found' });
    }
    // res.json(account);  
    return account;  
};

/* On, line 121, we create a model called Account and pass it our created account schema and we then export the module so that it can 
be re-used in other files.*/
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
