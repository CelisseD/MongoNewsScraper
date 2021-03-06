var express = require("express");
var router = express.Router();
var path = require("path");

var axios = require("axios");
var cheerio = require("cheerio");

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

// ROUTES

router.get("/", function (req, res) {
    res.redirect("/articles");
});

router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://chipandco.com/category/park/wdworlando/").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);
        var titlesArray = [];

        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        $("h2").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Then we grab the inner text of the this element and store it
            // to the head variable. This is the article headline
            result.title = $(this)
                .children()
                .text();

            result.link = $(this)
                .find("a")
                .attr("href");

            if (result.title !== "" && result.link !== "") {
                if (titlesArray.indexOf(result.title) == -1) {
                    titlesArray.push(result.title);

                    Article.count({
                        title: result.title, function(err, test) {
                            if (test === 0) {
                                var entry = new Article(result);

                                entry.save(function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(doc);
                                    }
                                });
                            }
                        }});
                } else {
                    console.log("Article already exists.");
                }
            } else {
                console.log("Not saved to DB, missing data");
            }
        });
        res.redirect("/");
    });
});
router.get("/articles", function (req, res) {
    Article.find().sort({ _id: -1 }).exec(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            var artcl = { article: doc };
            res.render("index", artcl);
        }
    });
});

router.get("/articles-json", function (req, res) {
    Article.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

router.get("/clearAll", function (req, res) {
    Article.remove({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed all articles");
        }
    });
    res.redirect("/articles-json");
});

router.get("/readArticle/:id", function (req, res) {
    var articleId = req.params.id;
    var hbsObj = {
        article: [],
        body: []
    };

    Article.findOne({ _id: articleId })
        .populate("comment")
        .exec(function (err, doc) {
            if (err) {
                console.log("Error: " + err);
            } else {
                hbsObj.article = doc;
                var link = doc.link;
                axios(link, function (error, response, html) {
                    var $ = cheerio.load(html);

                    $("h2").each(function (i, element) {
                        hbsObj.body = $(this)
                            .children("h2")
                            .children("p")
                            .text();

                        res.render("article", hbsObj);
                        return false;
                    });
                });
            }
        });
});
router.post("/comment/:id", function (req, res) {
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comment: doc._id } },
                { new: true }
            ).exec(function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/readArticle/" + articleId);
                }
            });
        }
    });
});

module.exports = router;