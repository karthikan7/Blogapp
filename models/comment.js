const { Schema, model } = require("mongoose");

const commentschema=new Schema({
    content:{
        type:String,
        required:true,
    },

    blogid:{
         type: Schema.Types.ObjectId,  // stores the user's ID
        ref: "blog",   //it will used to find perticular blog
    },
    //“Which blog does this comment belong to?”
    createdBy:{
        type: Schema.Types.ObjectId,  // stores the user's ID
        ref: "User",                  // links to the user model
    }//is to find perticular user
    //“Who wrote this comment?”
})

const comment = model("comment", commentschema);
module.exports = comment;  