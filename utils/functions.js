import mongoose from "mongoose";
import { ExpressError } from "./expressErrorClass.js";

export const checkObjectIdValidity = (objectId) => {
    if(!mongoose.Types.ObjectId.isValid(objectId)) {
        throw new ExpressError("ID is not Valid!", 400);
    }
    return;
};