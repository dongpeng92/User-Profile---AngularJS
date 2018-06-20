var express = require('express'),
    app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var mongodb = require('mongodb').MongoClient;
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
            console.log(docs);
            res.send(docs);
        }
    })
});

// app.get('/checkStatus/:uid', function (req, res) {
//     console.log(ObjectId(req.params.uid));
//     var myquery = {"_id": ObjectId("${req.params.uid}")};
//     db.collection('users').find(myquery).toArray(function (err, doc) {
//         if(!err) {
//             console.log("find");
//             console.log(doc);
//             res.send(doc);
//         }
//     })
// });

app.get('/deleteFlag', function (req, res) {
    console.log(req.query.user);
    db.collection('users').update({}, { $unset: { "isLoggedin": "" } }, function (err) {
        console.log("updated flag!!")
    });
    res.send({
        isLoggedin: false
    })
});