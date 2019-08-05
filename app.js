const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mysql = require("mysql");

const pool = mysql.createPool({
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_linja',
  password        : '9392',
  database        : 'cs290_linja',
});
module.exports.pool = pool;

const app = express();

app.use(express.static(__dirname + "/public"));
app.set("port", "9392");
app.set("view engine", "ejs");

app.use(express.urlencoded());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/result", function(req, res) {
  let context = {};
  pool.query("SELECT * FROM workouts", function(err, rows, fields) {
    res.send(rows);
    res.render("home", context);
  });
});

app.post("/", function(req, res) {
  if(req.body.request === "newEntry") {
    pool.query("INSERT INTO workouts (name, reps, weight, date, lbs) \
    VALUES (?, ?, ?, ?, ?)",
    [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs],
    function(err, result) {
      if(err) {
        throw(err);
      }
      else {
        res.render("home");
      }
    });
  }
  else if(req.body.request === "results") {
    pool.query("SELECT * FROM workouts", function(err, rows, fields) {
      if(err) {
        throw(err);
      }
      else {
        console.log(rows);
        res.send(rows);
        res.render("home");
      }
    });
  }
  else if(req.body.request === "editEntry") {
    pool.query("UPDATE workouts SET name=?, reps=?, weight=?, \
    date=?, lbs=? WHERE id=?", [req.body.name, req.body.reps,
      req.body.weight, req.body.date, req.body.lbs, req.body.id], function(err, result) {
      if(err) {
        throw(err);
      }
      else {
        res.render("home");
      }
    });
  }
  else if(req.body.request === "deleteEntry") {
    pool.query("DELETE FROM workouts WHERE id=?", [req.body.row], function(err, result) {
      if(err) {
        throw(err);
      }
      else {
        res.render("home");
      }
    });
  }
  else if(req.body.request === "select") {
    pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, rows, fields) {
      if(err) {
        throw(err);
      }
      else {
        console.log(rows);
        res.send(rows);
        res.render("home");
      }
    });
  }
});

app.get('/reset-table', function(req, res, next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('reset', {context: context});
    })
  });
});

//Render 404 page if page is not found
app.use(function(req, res) {
  res.status(404);
  res.render("404");
});

//Render 500 error message if server error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get("port"), process.env.IP);
