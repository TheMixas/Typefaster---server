// authentication-middleware.js
import jwt from 'jsonwebtoken';
import cookie from "cookie";

export function authenticateJWT(req, res, next) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.typefaster_token;
    console.log("cookies: ", cookies);
    console.log("token: ", token);

    if (token) {
        // const jwtToken = token.split(' ')[1];
        // console.log("jwtToken: ", jwtToken);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log("Error verifying token: ", err);
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

