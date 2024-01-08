import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

/*
    - Add "username" & "password" to "userSchema".
    - Check "username" & "password" are not duplicated.
*/
userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User", userSchema);