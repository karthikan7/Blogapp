const { Schema, model } = require("mongoose");

const blogschema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
<<<<<<< HEAD
        required: false,
=======
        required: false,     
>>>>>>> da15cb3 (update code)
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "comment",
        }
    ]
<<<<<<< HEAD
}, { timestamps: true });

const blog = model("blog", blogschema);
module.exports = blog;
=======
    //“What comments belong to this blog?”
}, { timestamps: true });  

const blog = model("blog", blogschema);
module.exports = blog;     
>>>>>>> da15cb3 (update code)
