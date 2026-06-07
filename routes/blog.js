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

// REMOVED: diskStorage = save file on our computer (not memory)
// NEW: CloudinaryStorage = save file on Cloudinary (cloud) not our server
const storage = new CloudinaryStorage({
// NEW: folder = which folder inside Cloudinary to save the image in
    cloudinary,
    params: {
        folder: 'blogify',
// NEW: allowed_formats = only accept these image types, reject others
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

// upload is our multer middleware, ready to use
const upload = multer({ storage });



router.get("/add", (req, res) => {
    res.render("addBlog", { user: req.user });//req.user is passed to the EJS view so the template knows who is currently logged in.
});

  router.get('/:id',async (req,res)=>{
        const blog=await Blog.findById(req.params.id).populate("createdBy");//MongoDB searches for: it stores current blog id
        //when we click any blog we should show its details so fectch data by id and show
        const comments=await Comment.find({blogid:req.params.id}).populate("createdBy");//It searches MongoDB for all comments that belong to a specific blog.
       //to fetch bloid in comments we should make one bloid model in comments

        // Prevents showing all comments from all blogs
        //.populate("createdBy")
       //  It replaces the user ID with actual user details.

       //Because in frontend you want:
       //<img src="<%= comment.createdBy.profileimageurl %>">
       //<%= comment.createdBy.fullname %>
        return res.render("blog",{
            user:req.user,
            blog,
            comments,
        })
})// pass user and perticular data using user id so you can show it on page (blog.title)

     router.post('/comment/:blogid', async (req, res) => {
            ///blog/B1
                // Blog document:
                // {
                // _id: "B1",
                // title: "My First Blog",
                // body: "Learning Node.js",
                // createdBy: "U5",
                // comments: []
                // }
        if (!req.user) {
        return res.redirect("/user/signin"); //  not logged in, send to signin
    }
      console.log("req.user =", req.user);        // ← add this
    console.log("req.user._id =", req.user._id);

    const comment = await Comment.create({
        content: req.body.content,
        blogid: req.params.blogid,
        createdBy: req.user._id|| req.user.id,
    });

        //  Add this push the new comment's ID into the blog's comments array
    await Blog.findByIdAndUpdate(req.params.blogid, {
        $push: { comments: comment._id }
    });

    res.redirect(`/blog/${req.params.blogid}`);
});    //after comment redirect the use to their blog page

// POST /blog/add  → receive form data and save to DB
// upload.single("coverImage") reads the file from the form
// "coverImage" must match the name="" in your HTML input
router.post("/add", upload.single("coverImage"), async (req, res) => {
    const { title, body } = req.body;

    // req.file has the uploaded image info (added by multer)
    // REMOVED: if user uploaded a file → save its path (local server path)
    // NEW: if user uploaded a file → save cloudinary URL
    // example URL: https://res.cloudinary.com/dn5xzdjkh/image/upload/blogify/abc123.jpg
    // if user did not upload  → save null
    const coverImage = req.file ? req.file.path : null;
    // NEW: req.file.path gives cloudinary URL instead of local filename

    // save everything to MongoDB
    // NEW: coverImage now stores a permanent Cloudinary URL instead of local path
    await Blog.create({
        title,
        body,
        coverImage,
        createdBy: req.user._id,  // logged in user's id that prasent in playload
    });

    return res.redirect("/");
});

module.exports = router;