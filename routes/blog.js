const express = require("express");
const router = express.Router();
// multer handles file uploads
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

// NEW: cloudinary = cloud storage service that saves images permanently online
const cloudinary = require('cloudinary').v2;
// NEW: multer-storage-cloudinary = connects multer and cloudinary together
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// NEW: tell cloudinary who we are using our .env credentials
// without this cloudinary won't accept our images
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// NEW: CloudinaryStorage = save file on Cloudinary (cloud) not our server
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'blogify',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

// upload is our multer middleware, ready to use
const upload = multer({ storage });

router.get("/add", (req, res) => {
    res.render("addBlog", { user: req.user });
});

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogid: req.params.id }).populate("createdBy");
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    })
});

router.post('/comment/:blogid', async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    console.log("req.user =", req.user);
    console.log("req.user._id =", req.user._id);

    const comment = await Comment.create({
        content: req.body.content,
        blogid: req.params.blogid,
        createdBy: req.user._id || req.user.id,
    });

    await Blog.findByIdAndUpdate(req.params.blogid, {
        $push: { comments: comment._id }
    });

    res.redirect(`/blog/${req.params.blogid}`);
});

// POST /blog/add → receive form data and save to DB
// upload.single("coverImage") reads the file from the form
// "coverImage" must match the name="" in your HTML input
router.post("/add", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, body } = req.body;

        // req.file has the uploaded image info (added by multer)
        // NEW: if user uploaded a file → save cloudinary URL
        // example URL: https://res.cloudinary.com/dn5xzdjkh/image/upload/blogify/abc123.jpg
        // if user did not upload → save null
        const coverImage = req.file ? req.file.path : null;
        // NEW: req.file.path gives cloudinary URL instead of local filename

        // save everything to MongoDB
        // NEW: coverImage now stores a permanent Cloudinary URL instead of local path
        await Blog.create({
            title,
            body,
            coverImage,
            createdBy: req.user._id,
        });

        return res.redirect("/");
    } catch (error) {
        console.error("Blog create error:", error);
        return res.status(500).send(error.message);
    }
});

module.exports = router;