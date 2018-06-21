var express = require('express'),
    app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var mongodb = require('mongodb').MongoClient;
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
const mongo_conn = 'mongodb://localhost/';
var db = '';

mongodb.connect(mongo_conn, function (err, client) {
    if(!err) {
        console.log("Connection established!!!");
        app.listen(3000, function () {
            console.log("Sever running @ localhost:3000");
        });
        db = client.db('user_profile');
    } else {
        console.log(err);
    }
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/postuser', function (req, res) {
    console.log(req.body);
    db.collection('users').insert(req.body, function (err) {
        if (!err) {
            console.log("data save!");
            res.send({
                flg: true
            });
        }
    })
});

app.get('/finduser', function (req, res) {
    db.collection('users').find({"username": req.query.username, "password": req.query.password}).toArray(function (err, docs) {
        if (!err) {
            console.log(req.query.username);
            console.log(req.query.password);
            var myquery = { username: req.query.username };
            var newvalues = { $set: { isLoggedin: true } };
            db.collection('users').update(myquery, newvalues, function (err) {
                console.log("updated!!")
            });
            docs[0].isLoggedin = true;
            console.log(docs);
            res.send(docs);
        }
    })
});

app.get('/checkStatus', function (req, res) {
    var myquery = {"isLoggedin": true };
    db.collection('users').find(myquery).toArray(function (err, docs) {
        if(!err) {
            console.log("find user");
            console.log(docs);
            res.send(docs);
        }
    })
});

app.get('/deleteFlag', function (req, res) {
    console.log(req.query.user);
    db.collection('users').update({}, { $unset: { "isLoggedin": "" } }, function (err) {
        console.log("updated flag!!")
    });
    res.send({
        isLoggedin: false
    })
});

app.post('/updateuser', function (req, res) {
    console.log(req.body);
    var newvalues = { $set: {"username": req.body.username, "password": req.body.password, "firstname": req.body.firstname,
                "lastname": req.body.lastname, "email": req.body.email, "phone": req.body.phone, "location": req.body.location} };
    db.collection('users').update({"isLoggedin": true}, newvalues, function (err) {
        console.log("updated user info!!")
        res.send({
            update: true
        });
    });
});

app.get('/getmessage', function (req, res) {
    console.log(req.query.username);
    var myquery = {"recipient": req.query.username };
    db.collection('message').find(myquery).toArray(function (err, docs) {
        if(!err) {
            console.log("find message");
            console.log(docs);
            res.send(docs);
        }
    })
});

app.post('/addreply', function (req, res) {
    console.log(req.body);
    console.log(req.query.id);
    var o_id = new mongo.ObjectID(req.query.id);
    db.collection('message').update({"_id": o_id}, {$set: req.body}, function (err) {
        res.send("Reply added!")
    });
});

app.get('/mark', function (req, res) {
    console.log(req.query.id);
    var o_id = new mongo.ObjectID(req.query.id);
    console.log(o_id);
    db.collection('message').update({"_id": o_id}, {$set: {"important": "important"}}, function (err) {
        res.send("Marked!")
    });
});

app.get('/deletemsg', function (req, res) {
    var o_id = new mongo.ObjectID(req.query.id);
    db.collection('message').remove({"_id": o_id}, function (err) {
        res.send("Deleted!");
    });
});