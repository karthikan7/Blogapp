require('dotenv').config()
const path = require("path");
const express = require("express");
const userroute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose=require('mongoose');
const cookieparser=require('cookie-parser');
const blog=require('./models/blog');
const { checkforauthentication } = require("./models/middaleware/authetication");

const app = express();
const PORT = process.env.PORT ||8000;

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
  console.log("MongoDB is connected");
})
.catch(err => {
  console.error("Connection error:", err);
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparser());

// makes the public folder accessible in browser
// so /uploads/abc.jpg works in <img src="/uploads/abc.jpg">
app.use(express.static(path.join(__dirname, "public")));
app.use(checkforauthentication("token"));//checking token every request then route runs

app.get("/",async (req, res) => {
    const allblogs = await blog.find({}).sort("-createdAt");
      console.log("req.user =", req.user);
    return res.render("home", {
        user: req.user,
        blog:allblogs,
            });
//sending user object when ever we render so we can use that data
//if you want to show somthing on page you should info from here or else  error
});

console.log("MONGODB_URL =", process.env.MONGODB_URL);
console.log("PORT =", process.env.PORT);

app.use("/user", userroute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING AT PORT:${PORT}`);
});