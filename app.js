var express = require('express'),
    app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

mongoose.connect('mongodb://localhost:27017/user_profile');
var db = mongoose.connection;
db.on('error', function () {
    console.log("Error happens!!");
});
db.on('open', function () {
    console.log("Connection established!!!");
});

app.listen(3000, function () {
    console.log("Server running @ localhost:3000")
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var user_schema = mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
    location: String,
    isLoggedin: Boolean
});
var user_model = mongoose.model('users', user_schema);

var message_schema = mongoose.Schema({
    recipient: String,
    recipient_img: String,
    sender: String,
    sender_img: String,
    title: String,
    description: String,
    created_at: String,
    important: String,
    reply: Array
});
var message_model = mongoose.model('messages', message_schema);

app.post('/postuser', function (req, res) {
    console.log(req.body);
    var new_user = user_model(req.body);
    new_user.save(function (err) {
        if (!err) {
            console.log("data save!");
            res.send({
                flg: true
            });
        }
    });
});

app.get('/finduser', function (req, res) {
    user_model.find({"username": req.query.username, "password": req.query.password}, function (err, docs) {
        if (!err) {
            console.log(docs);
            console.log(req.query.username);
            console.log(req.query.password);
            var myquery = { username: req.query.username };
            var newvalues = { $set: { isLoggedin: true } };
            user_model.update(myquery, newvalues, function (err, raw) {
                console.log(raw);
                console.log("updated!!")
            });
            docs[0].isLoggedin = true;
            console.log(docs);
            res.send(docs);
        }
    });
});

app.get('/checkStatus', function (req, res) {
    var myquery = {"isLoggedin": true };
    user_model.find(myquery, function (err, docs) {
        if(!err) {
            console.log("find user");
            console.log(docs);
            res.send(docs);
        }
    });
});

app.get('/deleteFlag', function (req, res) {
    user_model.update({"_id": req.query.id}, { "isLoggedin": false }, function (err, raw) {
        console.log("updated flag!!");
        res.send({
            isLoggedin: false
        });
    });
});

app.post('/updateuser', function (req, res) {
    console.log(req.body);
    var newvalues = { $set: {"username": req.body.username, "password": req.body.password, "firstname": req.body.firstname,
                "lastname": req.body.lastname, "email": req.body.email, "phone": req.body.phone, "location": req.body.location} };
    user_model.update({"isLoggedin": true}, newvalues, function (err) {
        console.log("updated user info!!");
        res.send({
            update: true
        });
    });
});

app.get('/getmessage', function (req, res) {
    var myquery = {"recipient": req.query.username};
    console.log(myquery);
    message_model.find(myquery, function (err, docs) {
        if(!err) {
            console.log("find message");
            console.log(docs);
            res.send(docs);
        }
    });
});

app.post('/addreply', function (req, res) {
    console.log(req.body);
    console.log(req.query.id);
    message_model.update({"_id": req.query.id}, {$set: req.body}, function (err) {
        res.send("Reply added!")
    });
});

app.get('/mark', function (req, res) {
    console.log(req.query.id);
    message_model.update({"_id": req.query.id}, {$set: {"important": "important"}}, function (err) {
        res.send("Marked!")
    });
});

app.get('/deletemsg', function (req, res) {
    message_model.remove({"_id": req.query.id}, function (err) {
        res.send("Deleted!");
    });
});