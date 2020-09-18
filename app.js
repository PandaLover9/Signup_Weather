require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https");
const { timeStamp } = require('console');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

/********************** MongoDB ****************************/
mongoose.connect("mongodb://localhost:27017/signUpUserDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

//listEmail as foreign key to User Schema
const ItemSchema = new mongoose.Schema ({
  itemName: String
});

const Item = mongoose.model("Item", ItemSchema);

//default item to show how to do with to do list
const item1 = new Item({
  itemName: "Welcome to your todolist."
  });

  const item2 = new Item({
  itemName: "Hit the add button to add a new to-do item."
  });

  const item3 = new Item({
  itemName: "Hit the delete button to delete a to-do item."
  });

  const defaultItems = [item1, item2, item3];

const signupSchema = new mongoose.Schema ({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  todoItem: [ItemSchema]
});

const User = new mongoose.model("user", signupSchema);


/********************** weather information ****************************/

//weather API


/************************ Home Route *******************/
app.get("/", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + process.env.APIKEY + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const weatherdata = JSON.parse(data);
      const temp = weatherdata.main.temp;
      const description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      const icon = weatherdata.weather[0].icon;
      const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      console.log(temp);
      res.render("home",
      {description: description,
        country: defaultCity,
        temp: temp,
        url: imageurl});
    });
  });

});


/*********************************************************/


/************************ Register Route *******************/
app.get("/register", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + process.env.APIKEY + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const weatherdata = JSON.parse(data);
      const temp = weatherdata.main.temp;
      const description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      const icon = weatherdata.weather[0].icon;
      const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      console.log(temp);
      res.render("register",
      {description: description,
        country: defaultCity,
        temp: temp,
        url: imageurl});
    });
  });
})

app.post("/register", function(req, res){
  const user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  });
  user.save();
    //   User.insertOne(user, function(err){
    //   if (err) {
    //   console.log(err);
    //   }
    //   else {
    //   console.log("Successfully saved into Database.");
    //   }
    // });
  res.redirect("/");

});

/*********************************************************/


app.get("/login", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + process.env.APIKEY + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const weatherdata = JSON.parse(data);
      const temp = weatherdata.main.temp;
      const description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      const icon = weatherdata.weather[0].icon;
      const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      console.log(temp);
      res.render("login",
      {description: description,
        country: defaultCity,
        temp: temp,
        url: imageurl});
    });
  });
});
var email;
var password;

app.post("/login", function(req,res){
    email =  req.body.login_email;
    password =  req.body.login_password;

    console.log(email + " " + password);

    User.findOne({email: email}, function(err, foundUser){
      if(err) {
        console.log(err);
      }
      else{
        //** email checking **//
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
      }
    });
});


app.get("/failed", function(req, res){
  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + process.env.APIKEY + "&units=" + units;

  https.get(url, function(response){
    console.log(response.statusCode);
    response.on("data", function(data){
      const weatherdata = JSON.parse(data);
      const temp = weatherdata.main.temp;
      const description = weatherdata.weather[0].description;
      const country = weatherdata.name;
      const icon = weatherdata.weather[0].icon;
      const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      console.log(temp);
      res.render("todolist",
      {description: description,
        country: defaultCity,
        temp: temp,
        url: imageurl});
    });
  });
});


app.get("/todolist", function(req,res){
  var defaultCity = "Singapore";
  var units = "metric";
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + process.env.APIKEY + "&units=" + units;

  console.log("Welcome, " + email);

    User.findOne({email: email}, function(err, foundUser){
      if(!err){
          if(foundUser){
            res.render("todolist", {newListItems: foundUser.todoItem});
          }
          else{
            console.log("No such user found, please log in again.");
            res.redirect("//login");
          }
      }
      else{
        console.log(err);
        res.sendStatus(err);
        res.redirect("/todolist")
      }
      

    })
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

  const defaultCity = "Singapore";
  const units = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + defaultCity +"&appid=" + process.env.APIKEY + "&units=" + units;
});

app.post("/delete", function(req, res){
  const itemId = req.body.checkId;

  User.findByIdAndDelete(itemId, function(err){
    if(!err){
      console.log("successfully deleted the item.");
      res.redirect("/todolist");
    }
    else{
      console.log(err);
    }
  })
})




let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000.");
});
