
import express from 'express';
import {GetProfile} from "../db/profile-db.js";
import {getUserByUsername} from "../db/user-db.js";
import {GetLeaderboards} from "../db/leaderboard-db.js";

export const leaderboardRouter = express.Router();

leaderboardRouter.get('/', async (req, res) => {
    try {
        console.log("leaderboard-router.js / called");

        //{}
        const leaderboards = await GetLeaderboards();
        console.log("Leaderboards: ", leaderboards);

        return res.status(200).send(leaderboards);
    }catch (e) {
        console.log("leaderboard-router.js / error:".e)
        return res.status(500).send("Something went wrong")
    }
})