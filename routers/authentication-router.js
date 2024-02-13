
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import validator from 'validator';

import {createUser, getUserByEmail, getUserByUsername} from "../db/user-db.js";
import {authenticateJWT} from "../middleware/auth-middleware.js"; // Import the pool

export const authRouter = express.Router();
authRouter.post('/register', async (req, res) => {
    try {
        const {username, email, password} = req.body;
        console.log("/register Received with body: ", req.body);

        //Make sure that the username, email and password are not empty
        if (!username || !email || !password) {
            return res.status(469).json({error: 'Please provide all required fields'});
        }

        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.status(401).json({error: 'Invalid email format'});
        }
        // Check if the username already exists
        const user = await getUserByUsername(username, "id");
        if (user) {
            return res.status(402).json({error: 'Username already exists'});
        }

        //Check if the email already exists
        const user2 = await getUserByEmail(email, "id");
        if (user2) {
            return res.status(403).json({error: 'Email already exists'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const userID = await createUser(username, email, hashedPassword);

        // Generate a JWT
        const token = jwt.sign({id: userID, username},
            process.env.JWT_SECRET, {expiresIn: '7d'});

        // Send the token to the client
        // res.status(200).setHeader('Authorization', 'Bearer ' + token);

        // if https, set secure to true and sameSite to none
        let maxAge = 7 * 24 * 60 * 60 * 1000;
        setCookie(res, token, maxAge);

        return res.status(201).send({id: userID, username, hi:"hi"})

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'Something went wrong'});
    }

});
authRouter.post('/login', async (req, res) => {
    try {
        console.log("/login Received with body: ", req.body);


        const {username, password} = req.body;


        const user = await getUserByUsername(username);


        if (!user) {
            return res.status(400).json({error: 'Invalid username or password'});
        }

        // Verify the password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({error: 'Invalid username or password'});
        }
        // Generate a JWT
        const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '7d'});

        let maxAge = 7 * 24 * 60 * 60 * 1000;
        setCookie(res, token, maxAge);


        // Send the token to the client
        res.status(200).setHeader('Authorization', 'Bearer ' + token);
        res.json({id: user.id, username: user.username})

    } catch (e) {
        console.log(e);
        return res.status(500).json({error: 'Something went wrong'});
    }

});

authRouter.post('/logout', authenticateJWT,(req, res) => {
    console.log("authentication-router.js: /logout called")
    res.cookie("typefaster_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // set to true if in production
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax', // set to 'none' if in production
        maxAge: 0,
        path: '/',
    });
    res.status(200).send({message: "Logged out"});

});
function setCookie(res, token, maxAge) {
    console.log("authentication-router.js: setCookie called")
    res.cookie("typefaster_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // set to true if in production
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax', // set to 'none' if in production
        maxAge: maxAge,
        path: '/',
    });
}
