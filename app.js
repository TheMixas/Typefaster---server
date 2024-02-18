import express from 'express';
//import dot env
import dotenv from 'dotenv';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

import {authRouter} from './routers/authentication-router.js';
import http from 'http';
import cors from "cors";
import {GetProfile} from "./db/profile-db.js";
import {profileRouter} from "./routers/profile-router.js";
import {GetLeaderboards} from "./db/leaderboard-db.js";
import {leaderboardRouter} from "./routers/leaderboard-router.js";
import path from "path";
import {fileURLToPath} from "url";
const allowedOrigins = process.env.NODE_ENV === 'production'? [
    'https://typefaster-365700105134.herokuapp.com'
] : ['http://localhost:3000',
    'http://localhost:5000',];

export const app = express();
app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/leaderboards', leaderboardRouter);


app.use((err, req, res, next) => {
    // Handle errors
    res.status(500).send('Something went wrong!');
});
app.use(express.static(path.join(__dirname + '/public')));

//host client
app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/index.html"), function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});






