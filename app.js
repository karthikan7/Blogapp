require('dotenv').config()
const path = require("path");
const fs = require('fs');
const express = require("express");
const userroute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require('mongoose');
const cookieparser = require('cookie-parser');
const blog = require('./models/blog');
const { checkforauthentication } = require("./models/middaleware/authetication");

const app = express();
const PORT = process.env.PORT || 8000;

// REMOVED: uploadDir / fs.mkdirSync block
// We no longer save images on our server
// Images now go directly to Cloudinary (cloud storage)
// So we don't need a local uploads folder anymore

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

// express.static still works for other public files like CSS, JS, user.jpg
// but uploaded blog images will now come from Cloudinary URLs
app.use(express.static(path.join(__dirname, "public")));
app.use(checkforauthentication("token")); // checking token every request then route runs

app.get("/", async (req, res) => {
    const allblogs = await blog.find({}).sort("-createdAt");
    console.log("req.user =", req.user);
    return res.render("home", {
        user: req.user,
        blog: allblogs,
    });
});

console.log("MONGODB_URL =", process.env.MONGODB_URL);
console.log("PORT =", process.env.PORT);

app.use("/user", userroute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING AT PORT:${PORT}`);
});