require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);


const signupSchema = new mongoose.Schema ({
  firstname: String,
  lastname: String,
  email: String,
  password: String
});

const User = new mongoose.model("user", signupSchema);




app.get("/", function(req, res){

  //weather API
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


app.post("/", function(req, res){

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

    console.log(user);
    res.redirect("/register");

});

app.get("/register", function(req, res){
  res.render("register");
})





let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000.");
});
