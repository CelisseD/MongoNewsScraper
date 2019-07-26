// DEPENDENCIES
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect Handlebars to Express
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Every request goes through our routes
var routes = require("./controllers/controllers.js");
app.use(routes);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
  });

mongoose.set("useCreateIndex", true);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    console.log("Connected to Mongoose!");
});


// Start the Server
app.listen(PORT, function() {
    console.log("Listening on port: http://localhost:" + PORT);
  });
