
const express = require("express");
const router = express.Router();
// multer handles file uploads
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");


// diskStorage = save file on our computer (not memory)
const storage = multer.diskStorage({
// destination = which folder to save the file in
    destination: (req, file, cb) => {
        cb(null, "public/uploads");  // saves inside public/uploads/
    },

    // filename = what name to give the saved file
    filename: (req, file, cb) => {
        // unique number so two files never have same name
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // extname gets the extension e.g. .jpg .png
        cb(null, unique + path.extname(file.originalname));
        // final name looks like: 1719123456789-385729384.jpg
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
    // if user uploaded a file → save its path
    // if user did not upload  → save null
    const coverImage = req.file ? "/uploads/" + req.file.filename : null;

  
    // save everything to MongoDB
    await Blog.create({
        title,
        body,
        coverImage,
        createdBy: req.user._id,  // logged in user's id that prasent in playload
    });

    return res.redirect("/");
});

module.exports = router;

