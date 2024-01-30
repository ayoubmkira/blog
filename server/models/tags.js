import mongoose from "mongoose";

const { Schema } = mongoose;

const tagSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }]
});

tagSchema.post("updateOne", async function (tag) {
    if(tag) {
        console.log("A Tag Was Updated");
    }
});

export const Tag = mongoose.model("Tag", tagSchema);