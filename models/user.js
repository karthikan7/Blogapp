const { Schema, model } = require("mongoose");
const { createHmac,randomBytes} = require('node:crypto');
const { createtoken } = require("./services/authetication");

const userschema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
         
    },
    profileimageurl: {
        type: String,
        default: "/user.jpg",
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"],
    },
    password: {
        type: String,
        required: true,
    },
});

userschema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = randomBytes(16).toString("hex");

    const hash = createHmac("sha256", salt)
        .update(this.password)
        .digest("hex");

    this.salt = salt;
    this.password = hash;
});
    //it is hased with salt
//take current user before adding 

userschema.static("matchPasswordandgeneratetoken", async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) {
        throw new Error("user not found");
    }

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");
    if( hashedPassword !== userProvidedHash){
        throw new Error("Incorrect password");
    }
    const token=createtoken(user);
    return token;

//create and return  token after password match

});


const User = model("User", userschema);

module.exports = User;