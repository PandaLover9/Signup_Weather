require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https");
const swal = require('sweetalert');

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

//Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/********************** MongoDB ****************************/
mongoose.connect("mongodb://localhost:27017/signUpUserDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true});
mongoose.set("useCreateIndex", true);

//listEmail as foreign key to User Schema
const ItemSchema = new mongoose.Schema ({
  itemName: String
});

const Item = mongoose.model("Item", ItemSchema);

const signupSchema = new mongoose.Schema ({
  firstname: String,
  lastname: String,
  email: String,
  googleId: String,
  password: String,
  todoItem: [ItemSchema]
});

signupSchema.plugin(passportLocalMongoose);
signupSchema.plugin(findOrCreate);

const User = new mongoose.model("user", signupSchema);

/************************Google API *****************************/
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//userProfileURL is to tackle Google Plus API deprecation
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/todolist",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id , firstname: profile.name.givenName,  lastname: profile.name.familyName}, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/todolist",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to todolist.
    res.redirect("/todolist");
  });

/********************** weather information ****************************/

//weather API
var weatherdata;
var temp;
var description;
var icon;
var imageurl;


/************************ Home Route *******************/
app.get("/", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + "b29ace636c42b24520b21f5585fd1d77" + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      weatherdata = JSON.parse(data);
      currentTime = weatherdata.dt;

      var date = new Date(currentTime * 1000);
      console.log(date);
      // Hours part from the timestamp
      var hours = date.getHours() + 8;
      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();

      // Will display time in 10:30:23 format
      var formattedTime = hours + ':' + minutes.substr(-2);

      temp = weatherdata.main.temp;
      description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      icon = weatherdata.weather[0].icon;
      imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      res.render("home",
      {description: description,
       country: defaultCity,
       temp: temp,
       url: imageurl,
       time: formattedTime});
    });
  });

});

/*********************************************************/


/************************ Register Route *******************/
app.get("/register", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + "b29ace636c42b24520b21f5585fd1d77" + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      weatherdata = JSON.parse(data);
      currentTime = weatherdata.dt;

      var date = new Date(currentTime * 1000);
      // Hours part from the timestamp
      var hours = date.getHours() + 8;
      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();

      // Will display time in 10:30:23 format
      var formattedTime = hours + ':' + minutes.substr(-2);

      temp = weatherdata.main.temp;
      description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      icon = weatherdata.weather[0].icon;
      imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      res.render("register",
      {description: description,
       country: defaultCity,
       temp: temp,
       url: imageurl,
       time: formattedTime});
    });
})
})

app.post("/register", function(req, res){
  const user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  });
  User.findOne({email: user.email}, function(err, foundExistingUser){
    //email already registered
    if(foundExistingUser){
      console.log("Email has already been registered. Please register with another email.");
      swal("Email has already been registered. Please register with another email.", "haha", "warning");
      res.redirect("/register");
    }
    else{
      user.save();
      res.redirect("/");
    }
  })
  

});
/*********************************************************/


/************************ Login Route *******************/
app.get("/login", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + "b29ace636c42b24520b21f5585fd1d77" + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      weatherdata = JSON.parse(data);
      currentTime = weatherdata.dt;

      var date = new Date(currentTime * 1000);
      // Hours part from the timestamp
      var hours = date.getHours() + 8;
      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();

      // Will display time in 10:30:23 format
      var formattedTime = hours + ':' + minutes.substr(-2);

      temp = weatherdata.main.temp;
      description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      icon = weatherdata.weather[0].icon;
      imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      res.render("login",
      {description: description,
       country: defaultCity,
       temp: temp,
       url: imageurl,
       time: formattedTime});
    });
});
});

//global variable to check email
var email;
var googleId;
var firstname;

app.post("/login", function(req,res){
    email =  req.body.login_email;
    password =  req.body.login_password;

    User.findOne({email: email}, function(err, foundUser){
      if(err) {
        console.log(err);
      }
      else{
        //** email checking **//
        passport.authenticate("local")(req, res, function(){
        if(foundUser){
          //** password checking **//
          if(foundUser.password == password){
            
            res.redirect("/todolist");
          }
          else{
            console.log("Password is wrong, please insert again.");
            res.redirect("/login");
          }
        }
        else {
          console.log("Email is incorrect. Please Log In Again.");
          
          res.redirect("/login");
        }
      })
    }
    });
});
/*********************************************************/


app.get("/failed", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + "b29ace636c42b24520b21f5585fd1d77" + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      weatherdata = JSON.parse(data);
      temp = weatherdata.main.temp;
      description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      icon = weatherdata.weather[0].icon;
      imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      console.log(temp);
      res.render("todolist",
      {description: description,
        country: defaultCity,
        temp: temp,
        url: imageurl});
    });
  });
});

/************************ To Do List Route *******************/

app.get("/todolist", function(req, res){
  var defaultCity = "Singapore";
  var units = "metric";
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + "b29ace636c42b24520b21f5585fd1d77" + "&units=" + units + "exclude=current";

  if(email != ""){
    console.log("Welcome, " + email);
    User.findOne({email: email}, function(err, foundUser){
      if(!err){
          if(foundUser){
            res.render("todolist", {newListItems: foundUser.todoItem});
          }
          else{
            console.log("No such user found, please log in again.");
            res.redirect("/login");
          }
      }
      else{
        console.log(err);
        res.sendStatus(err);
        res.redirect("/todolist")
      }
    })
    }
    else{
      console.log("Welcome, " + firstname);
      User.findOne({googleId: googleId}, function(err, foundUser){
        if(!err){
            if(foundUser){
              res.render("todolist", {newListItems: foundUser.todoItem});
            }
            else{
              console.log("No such user found, please log in again.");
              res.redirect("/login");
            }
        }
        else{
          console.log(err);
          res.sendStatus(err);
          res.redirect("/todolist")
        }
      })
    }
  

    
});

app.post("/todolist", function(req,res){
  const newItem =  req.body.newItem;

  //insert new to-do-item
  const item = new Item({
    itemName: newItem
  });

  //find user_id
  User.findOne({email: email}, function(err, foundUser){
    
    if(!err)
    {
      if(!foundUser){
        console.log("No such user found, please log in again.");
        res.redirect("/todolist");
    }
      else{
          foundUser.todoItem.push(item);
          foundUser.save();
          res.redirect("/todolist");
      }
    }
    else{
      console.log(err);
      res.sendStatus(err);
      res.redirect("/login");
    }
    
  })
});

/*****************************************************************/

app.post("/delete", function(req, res){
  const itemId = req.body.checkId;

  User.findOneAndUpdate({email: email}, {$pull: {todoItem: {_id: itemId}}}, function(err){
    if(!err){
      console.log("successfully deleted the item.");
      console.log(itemId);
      res.redirect("/todolist");
    }
    else{
      console.log(err);
    }
  })
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});




let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000.");
});

//Google FB API, Google Auth20, Hashing Salting pw, Header home, register, login, Logout Cookies Session