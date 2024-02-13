import {    app} from './app.js';
import {createNewRoom, findPublicLobbyWithMostPlayers} from "./gameManager.js";
const port = process.env.PORT || 5000;
import cors from 'cors';
import http from "http";
import initializeSocketEvents from './socket.js';
import {Server} from "socket.io";
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
];
let corsOptions = {
    origin: allowedOrigins,
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    credentials: true
}


const server = http.createServer(app);

// Initialize Socket.IO server
export const io = new Server(server, {
    cors: corsOptions
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
initializeSocketEvents();




