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
        required: false,
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
}, { timestamps: true });

const blog = model("blog", blogschema);
module.exports = blog;
