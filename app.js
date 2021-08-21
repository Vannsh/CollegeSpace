require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt"); 
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const url = require("url");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findOrCreate");
const GitHubStrategy = require("Passport-GitHub2").Strategy;






mongoose.connect('mongodb://localhost:27017/reviewDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

let foundPath;
let user_id, movie;

const reviewSchema = new mongoose.Schema({
    name: String,
    review: {
        type: String,
        required: [true, "Please enter the review section in your data!"]
    }
});
const Review = new mongoose.model("Review", reviewSchema);
const item1 = new Review({
    name: "vannsh,Sharanpur",
    review: "this is the best website i found in my life"
});
const item2 = new Review({
    name: "shikhar",
    review: "Hello everyone I'm new here btw!"
});

let review = [item1, item2];



// Here are all things related to login and signup Page
app.get("/loginORsignup", function(req, res) {
    foundPath = url.parse(req.url).pathname;
    console.log(foundPath);
    if (req.isAuthenticated()) {
        // const user_id = req. user._id;
        // console.log(user_id);
        res.render("portal", { printdata: movie });
    } else {
        res.render("loginORsignup");
    }

});

const questions = new mongoose.Schema({
    Q: String,
    T: String,
    D: String,
    img: String,
    N: String
})
const Qus = new mongoose.model("question", questions);
const userDetail = new mongoose.Schema({
    name: String,
    lname: String,
    username: String,
    password: String,
    googleId: String,
    githubId: String,
    blogging: {
        blogged: String,
        bloggedDate: String,
        bloggedTime: String
    },
    imagename: String,
    review: String,
    questionAsked: [{ Question: String, Time: String }]
});
userDetail.plugin(passportLocalMongoose, {
    selectFields: 'username name lname imagename'
});
userDetail.plugin(findOrCreate);

// userDetail.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
// const Upload = new mongoose.model("Upload", userPhoto);
const Detail = new mongoose.model("Detail", userDetail);

passport.use(Detail.createStrategy());
// passport.use('local-signup', new LocalStrategy({usernameField: "username", passwordField: "password", passReqToCallback : true },
//   function(req, username, password, done){
//     var firstname = req.body.first;
//     var lastname = req.body.last;
//   }
// ));
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Detail.findById(id, function(err, user) {
        done(err, user);
    });
});

//every thing related to review section is Here




app.get("/", function(request, response) {
    Detail.find({ "review": { $ne: null } }, function(err, reviewUser) {
        if (err) console.log(err);
        else {
            if (reviewUser) {
                response.render("project", { userData: reviewUser });
            }
        }
    });
});
// Review.find({}, function(err, foundReviews){
//   if(foundReviews.length===0){
//     Review.insertMany(review, function(err){
//       if(err) console.log(err);
//       else console.log("Data successfully updated!");
//     });
//     response.redirect("/");
//   } else response.render("project", {userData: foundReviews});
//
// });





app.get("/allreviews", function(req, res) {
    Detail.find({ "review": { $ne: null } }, function(err, reviewUser) {
        if (err) console.log(err);
        else {
            if (reviewUser) {
                res.render("allReviews", { userData: reviewUser });
            }
        }
    });
    // Review.find({}, function(err, foundReviews){
    //   res.render("allReviews", {userData: foundReviews});
    // });
});



app.get("/addreview", function(req, res) {
    foundPath = url.parse(req.url).pathname;
    if (req.isAuthenticated()) res.render("addreview", { userFirst: req.user.name, userLast: req.user.lname });
    else {
        res.render("loginORsignup");
    }

});

app.post("/addreview", function(req, res) {
    // console.log(req.user.id);
    Detail.findById(req.user.id, function(err, foundUser) {
        if (err) console.log(err);
        else {
            if (foundUser) {
                // console.log(foundUser);
                foundUser.review = req.body.reviewData;
                foundUser.save(function() {
                    res.redirect("/");
                });
            }
        }
    });
    // const addedReview = new Review({
    //   name: req.body.userName,
    //   review: req.body.reviewData
    // });
    // addedReview.save();
    // res.redirect("/");
});
app.post("/delete", function(req, res) {
    let clickedReview = req.body.button;
    Review.findByIdAndRemove(clickedReview, function(err) {
        if (err) console.log(err);
        else {
            console.log("Data successfully Deleted!");
            res.redirect("/");
        }
    });
});








// for google authentication
// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/portal",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
//   },
//   function(accessToken, refreshToken, profile, cb) {
// console.log(profile);
//     Detail.findOrCreate({ googleId: profile.id, name: profile.name.givenName, lname: profile.name.familyName, imagename: profile.photos[0].value }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));
// for github authentication
// passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/github/portal"
//   },
// function(accessToken, refreshToken, profile, done) {
// console.log(profile);
//     Detail.findOrCreate({ githubId: profile.id, name: profile.username, imagename: profile.photos[0].value  }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));


// routes for google authentication
// app.get('/auth/google',
//     passport.authenticate("google", { scope: ["profile"] })
// );
// app.get("/auth/google/portal",
//     passport.authenticate("google", { failureRedirect: '/loginORsignup' }),
//     function(req, res) {
// Successful authentication, redirect to portal
// console.log(req.user);
//     movie = req.user;
//     res.redirect("/portal");
// });


// routes for github authentication
// app.get('/auth/github',
//     passport.authenticate('github', { scope: ["profile"] })
// );
// app.get('/auth/github/portal',
//     passport.authenticate('github', { failureRedirect: '/loginORsignup' }),
//     function(req, res) {
// Successful authentication, redirect to portal.
//     res.redirect('/portal');
// });



const user1 = new Detail({
    name: "Rahul",
    lname: "Chauhan",
    email: "rahulchauhan07@gmail.com",
    password: "hello"
});
// user1.save();
app.get("/register", function(req, res) {
    res.render("register");
});
app.get("/portal", function(req, res) {
    if (req.isAuthenticated()) {
        console.log(req.user._id);
        Detail.findById(req.user._id, function(err, doc) {
            if (err) console.log(err);
            else movie = doc;
        });
        res.render("portal", { printData: movie });
    } else res.redirect("/loginORsignup");
});
app.post("/logout", function(req, res) {
    req.logout();
    res.redirect("/loginORsignup");
});

const Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
// +path.extname(inpFile.originalname)
const upload = multer({ storage: Storage }).single("inpFile");
// app.post("/register", upload, function(req, res, next){
//   const imagefile = req.file.filename;
//   const imageDetails = new Upload({
//     filename: imagefile
//   });
//   imageDetails.save();
// });


app.post("/register", upload, function(req, res, next) {
    // const imagefile = req.inpFile.filename;
    // const imageDetails = new Upload({
    //   filename: imagefile
    // });
    // imageDetails.save();
    Detail.register(new Detail({ username: req.body.username, name: req.body.first, lname: req.body.last, imagename: req.file.filename }), req.body.password, function(err, detail) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                console.log("Registered");
                res.redirect("/portal");
            })
        }
    })
});

app.post("/login", function(req, res) {

    const user = new Detail({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                user_id = req.user._id;
                console.log(user_id);
                async function run() {
                    try {
                        movie = await Detail.findOne({ _id: user_id });
                        console.log(movie.username);
                        if (foundPath === "/loginORsignup")

                            res.render("portal", { printData: movie });
                        else {
                            res.redirect(foundPath);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                run();
            });
        }
    })
});




// blog sectionn----------------------
app.get("/blog", function(req, res) {
    Detail.find({ "blogging": { $ne: null } }, function(err, blogUser) {
        if (err) console.log(err);
        else {
            if (blogUser) {

                res.render("blog", { blogName: blogUser });
            }
        }
    });
});
app.get("/writingblog", function(req, res) {
    foundPath = url.parse(req.url).pathname;
    if (req.isAuthenticated()) {
        res.render("writingblog", { userNameF: req.user.name, userNameL: req.user.lname });
    } else {
        res.render("loginORsignup");

    }
});
app.post("/writingblog", function(req, res) {
    console.log(req.user.name);
    const writtenblog = req.body.blogData;
    Detail.findById(req.user.id, function(err, foundUser) {
        if (err) console.log(err);
        else {
            if (foundUser) {
                // console.log(req.body.blogData);
                // console.log(foundUser);
                let date = new Date().toDateString();
                let time = new Date().toLocaleTimeString();
                foundUser.blogging.blogged = writtenblog;
                foundUser.blogging.bloggedDate = date;
                foundUser.blogging.bloggedTime = time;
                foundUser.save(function() {
                    res.redirect("/blog");
                });
            }
        }
    })
})

app.get("/askingQus", function(req, res) {
    foundPath = url.parse(req.url).pathname;
    if (req.isAuthenticated()) {
        res.render("askingQus", { userNameF: req.user.name, userNameL: req.user.lname });
    } else {
        res.render("loginORsignup");

    }
});
app.post("/askingQus", function(req, res) {
    let date = new Date().toDateString();
    let time = new Date().toLocaleTimeString();
    const question = req.body.qusData;
    const qus = new Qus({
        Q: question,
        T: time,
        D: date,
        img: req.user.imagename,
        N: req.user.name + " " + req.user.lname
    });
    qus.save();
    Detail.findByIdAndUpdate(req.user.id, { $push: { questionAsked: { Question: question, Time: date } } },
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/portal");
            }
        }
    )
})

// visiting to profile part

app.get("/profile", function(req, res) {
    res.render("uProfile", { printData: movie });
});


app.post("/changePassword", function(req, res) {
    const username = req.user.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.password;
    console.log(username, " ", oldPassword, " ", newPassword);
    async function run() {
        try {
            const user = await Detail.findByUsername(username);
            await user.changePassword(oldPassword, newPassword);
            await user.save();
            // req.flash("success", "Your password is recently updated. Please log in again to confirm");
            req.logOut();
            res.redirect("/loginORsignup");
        } catch (err) {
            console.log(err);
            res.redirect("back");
        }
    }
    run();
});



app.post("/updateProfile", function(req, res) {
    async function run() {
        try {
            const userUpdateData = {
                "name": req.body.firstName,
                "lname": req.body.lastName,
                "username": req.body.email
            }
            await Detail.findByIdAndUpdate(req.user._id, userUpdateData);
            req.logOut();
            res.redirect("/loginORsignup");
        } catch (err) {
            console.log(err);
            res.redirect("back");
        }
    }
    run();
})


app.get("/feeds", function(req, res) {
    if (req.isAuthenticated()) {
        Qus.find({}, function(err, questn) {
            if (err) console.log(err);
            else {
                // console.log(questn);
                res.render("feeds", { printData: movie, allqus: questn });
            }
        });
    } else res.redirect("loginORsignup");
});





app.listen(3000, function() {
    console.log("server is running on port 3000")
});