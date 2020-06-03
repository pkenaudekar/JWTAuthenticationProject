const express = require("express");
const app = express();
const accountRouter = require("./routers/account");
//const port = process.env.PORT;

const port = 3000;
require("./db/db");

var cookieParser = require('cookie-parser');

app.use(cookieParser());
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));
app.use(express.static('public/js'));
app.use(express.json());
app.use(accountRouter);

app.use('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, function(){
    console.log("Server listening on port " + port);
});




