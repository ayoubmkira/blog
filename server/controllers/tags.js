import { ExpressError } from "../../utils/expressErrorClass.js";
import { Tag } from "../models/tags.js";

export const createNewTag = async (req, res) => {
    try {
        const { name } = req.body.tag;
        const existingTag = await Tag.findOne({ name });

        if(existingTag) {
            throw new ExpressError("Tag name already exist!", 400);
        }

        const newTag = new Tag(req.body.tag);
        await newTag.save();

        res.status(201).json({ tag: newTag, message: "Tag created Successfully." });
    } catch (error) {
        res.status(400).json(error);
    }
};