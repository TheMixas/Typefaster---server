import express from 'express';
import {GetProfile} from "../db/profile-db.js";
import {getUserByUsername} from "../db/user-db.js";

export const profileRouter = express.Router();

profileRouter.get('/:username', async (req, res) => {
    try {
        const {username} = req.params;
        console.log("Received get profile with username: ", username);

        //check if user exists
        let user = await getUserByUsername(username);
        if(user === undefined){
            return res.status(404).send("User not found");
        }
        const profile = await GetProfile(username);

        return res.status(200).send(profile);
    }catch (e) {
        console.log("profile-router.js /:username error:".e)
        return res.status(500).send("Something went wrong")
    }
})