var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local'); // allow kar rha hum koi account bna sakha username or password ke base pe
passport.use(new localStrategy(userModel.authenticate())); //login rakh rha ha
const upload = require('./multer');
const postModel = require('./post');

router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});

router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find({}).populate('user');
  // userModel.populate sa hum real user ka data access kar sakha haan
  res.render('feed', { footer: true, posts,user });
});

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('posts');
  res.render('profile', { footer: true, user });
});

router.get('/like/post/:id', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.findOne({ _id: req.params.id });
  //if already liked remove like
  //if not liked add like
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id),1);
  }
  await post.save();
  res.redirect('/feed');
});

router.get('/search', isLoggedIn, function (req, res) {
  res.render('search', { footer: true });
});

router.get('/edit', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('edit', { footer: true, user });
});

router.get('/upload', isLoggedIn, function (req, res) {
  res.render('upload', { footer: true });
});

router.get('/username/:username', isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users = await userModel.find({ username: regex });
  res.json(users);
});

router.post("/register", function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  userModel.register(userData, req.body.password) //register yha account bna rha haan or account bna rha haan humara database maan
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      }); //issa [process kar rha haan hum login ko]
    })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
}), function (req, res) { }); //login kar rha haan hum

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

router.post('/update', upload.single('image'), async function (req, res) {
  // const user = await userModel.findOneAndUpdate(unique,data,{new:true}); // (find,update,option)
  const user = await userModel.findOneAndUpdate({ username: req.session.passport.user }, {
    username: req.body.username,
    name: req.body.name,
    bio: req.body.bio,
  }, { new: true });
  if (req.file) {
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect('/profile');
});

router.post('/upload', isLoggedIn, upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    picture: req.file.filename,
    user: user._id,
    caption: req.body.caption,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/feed');
}); //upload kar rha haan hum

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); //ALREADY LOGIN HAAN TOH DATA ACCESS KAR SAKHA HAAN
  }
  res.redirect("/login"); //LOGIN NAHI HAAN TOH LOGIN KARNA KA LIYA BOLA RAHA HAAN
}

module.exports = router;
