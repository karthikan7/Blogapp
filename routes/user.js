const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");

const router = Router();

router.get("/signin", (req, res) => {
   return res.render("signin", {
        error: null,
    });
});
router.get("/signup", (req, res) => {
  return res.render("signup", {
        error: null,       //  
    });;
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const token = await User.matchPasswordandgeneratetoken(email,password );

        return res.cookie("token", token).redirect("/");//store token in cookie
    } catch (error) {
        return res.render("signin",{
            error:error.message,//error property
        })
    }
});
 //store token in cookie
//use try catch if password wrong
router.get('/logout',(req,res)=>{
    res.clearCookie('token').redirect("/");
})

router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;//data sent by user

    await User.create({
      fullname,
      email,
      password,
    });

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating user or his Email already exist");
  }
});

module.exports = router;