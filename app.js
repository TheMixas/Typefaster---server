import express from 'express';
//import dot env
import dotenv from 'dotenv';
dotenv.config();
import {authRouter} from './routers/authentication-router.js';
import http from 'http';
import cors from "cors";
import {GetProfile} from "./db/profile-db.js";
import {profileRouter} from "./routers/profile-router.js";
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
];

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

console.log('get profile', await GetProfile('2'));
//Error handling
app.use((err, req, res, next) => {
    // Handle errors
    res.status(500).send('Something went wrong!');
});






