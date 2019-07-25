var express = require("express");
var router = express.Router();
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("../models");

// ROUTES

router.get("/", function (req, res) {

    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.render("index", { hbsObjectMain: dbArticle.reverse() });
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://chipandco.com/category/park/wdworlando/").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        let $ = cheerio.load(response.data);

        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        $("h2").each(function (i, element) {
            // Save an empty result object
            let result = {};

            // Then we grab the inner text of the this element and store it
            // to the head variable. This is the article headline
            result.title = $(element).find("h3").text();
            result.link = $(element).children("a").attr("href");
            result.summary = $(element).find("p").text();

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    //     console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// GRAB ARTICLES FROM DB
router.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Export the function, so other files in our backend can use it
module.exports = router;