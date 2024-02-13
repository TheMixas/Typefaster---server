import { io } from './index.js';
import { Events } from './events.js';
import {handleClientVoteForGenre} from './sockets/genre-voting.socket.js'
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import {createNewRoom, findPublicLobbyWithMostPlayers, getGame, getGames, getPlayerFromRoomUID} from "./gameManager.js";
import Player from "./game/Player.js";
import {
    COUNTDOWN_TIME,
    FINISHED_TRANSITION_TO_LOBBY_TIME,
    PLAYERS_NEEDED_TO_START,
    THEME_SELECTION_TIME
} from "./constants.js";
import {InProgressState} from "./game/GameState.js";
export default function initializeSocketEvents() {
    console.log('Socket.IO initialized');
    io.use(authenticateSocket)
    io.on('connection', (socket) => {
        console.log('A user connected hi');

       socket.on(Events.CLIENT_WANTS_PLAY, (data) => {

            handlePlay(socket, data);

        })
        socket.on(Events.CLIENT_WANTS_CREATE_GAME, (data) => {
            handleCreateGame(socket, data);
            // Do something with the data
        })
        socket.on(Events.CLIENT_WANTS_START_GAME, (data) => {
            handleStartGame(socket, data);
        })
        socket.on(Events.CLIENT_SENDS_WANTED_CURRENT_TEXT, (data) => {
            handleClientSendsWantedText(socket, data);
        })
       socket.on(Events.CLIENT_SENDS_GENRE_VOTE, (theme,cb) => {
           handleClientVoteForGenre(socket, theme, cb);
       })
        socket.on(Events.CLIENT_WANTS_JOIN_GAME, (data) => {
            handleJoinGame(socket, data);
        })
        socket.on('disconnect', (data) => {
            handleDisconnect(socket, data);
            console.log('socket.js: A user disconnected, id: ', socket.id);
            // Cleanup logic if needed
        });
    });
}



function authenticateSocket(socket, next) {
    console.log('socket.js: Authenticating socket: socket.handshake.headers', socket.handshake.headers)
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.typefaster_token;

    if (!token) {
        console.log('No token provided');
        socket.user = { guest: true }; // Attach a guest object to the socket
        next();
    } else {
        console.log('Token provided');
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('Token verification failed');
                socket.user = { guest: true }; // Attach a guest object to the socket if token verification fails
            } else {
                console.log('Token verified');
                socket.user = decoded; // Attach the decoded user object to the socket if token is verified
            }
            next();
        });
    }

}
function handleDisconnect(socket){
    console.log('Client wants to disconnect');
    // Get the game from the socket object
    const game = socket.game;
    if (game) {
        // Remove the player from the game
        game.removePlayer(socket.id);
        socket.to(game.roomUID).emit(Events.SERVER_PLAYER_LEFT, { socketID: socket.id });
    }
}
function handlePlay(socket, data) {
    try{
        console.log('Client wants to play');
        console.log("socket.id on want play: ", socket.id);
        let game = findPublicLobbyWithMostPlayers();
        if (!game) {
            console.log("no game found, creating new one");
            game = createNewRoom();
        }

        //Check if socket is already in a game
        if (socket.rooms.size > 1) {
            console.log("socket is already in a game");
            return;
        }

        playerJoinGame(socket, game)
        game.addThemeVote("Default", socket.id);
        game.attemptStartGame()
    }catch (e) {
        console.log("error when handling play: ", e.message);
    }



}
function handleCreateGame(socket, data) {
    console.log('Client wants to create a game');
    //check if socket is already in a game
    if (socket.rooms.size > 1) {
        console.log("socket is already in a game");
        return;
    }
    let game = createNewRoom(true, socket.id);
    playerJoinGame(socket, game)
}

function handleJoinGame(socket, data) {
    console.log("Player attempting to join custom game")

    console.log('Client wants to join a game');
    //check if socket is already in a game
    if (socket.rooms.size > 1) {
        console.log("socket is already in a game");
        return;
    }
    let game = getGame(data.gameUID);
    if (!game) {
        console.log("game does not exist");
        return;
    }
    playerJoinGame(socket, game)
    console.log("Player joined custom game")
    // game.attemptStartGame()

}
function handleStartGame(socket, data) {
    console.log('Client wants to start a game');
    if(!socket.game) {
           console.log("socket is not in a game");
        return;
    }
    let game = socket.game;
    //If game is PRIVATE, only the host can start the game
    if(game.isPrivate && game.creatorSocketID!== socket.id){
        console.log("private game, socket is not the host");
        return;
    }

    //For public games, a game can be force started only if there is only one player in it,
    // for games start this way, disable certain stats gained.
    if(game.getPlayerCount() ===1){
        game.setIsSinglePlayer(true);
    }
    game.startGame();
}
function handleClientSendsWantedText(socket, data) {
    if(!socket.game) {
        console.log("socket is not in a game");
        return;
    }
    if(!socket.game.state instanceof InProgressState){
        console.log("game is not in progress");
        return;
    }

    // console.log("received CLIENT_SENDS_WANTED_CURRENT_TEXT, index: ", data.index);
    let player = socket.game.getPlayer(socket.id);
    player.sendCurrentWordIndex(data.index);
}
/**
 * This function is responsible for managing the process of a player joining a game.
 * It creates a new Player instance, adds the player to the game, joins the game room,
 * and emits a SERVER_JOINED_GAME event.
 *
 * @param {Object} socket - The socket object representing the player's connection.
 * @param {Object} game - The game object representing the game the player is joining.
 *
 * @property {string} socket.user.username - The username of the player.
 * @property {Object} socket.game - The game object that the player is joining.
 * @property {Object} socket.player - The player object that represents the player.
 * @property {string} game.roomUID - The unique identifier of the game room.
 * @property {function} game.addPlayer - The function to add a player to the game.
 * @property {function} game.getAllPlayersInfo - The function to get all players' information in the game.
 *
 * @returns {void}
 */
function playerJoinGame(socket, game) {
    const player = new Player(socket);
    //get game players, without the new player
    let gamePlayers = game.getAllPlayersInfo();
    socket.to(game.roomUID).emit(Events.SERVER_PLAYER_JOINED, { player: player.getInformation() });
    game.addPlayer(player);
    socket.join(game.roomUID);
    socket.game = game;
    socket.player = player;
    //EMIT SERVER_JOINED_GAME to the player that joined
    //Contains important data
    socket.emit(Events.SERVER_JOINED_GAME, { gameUID: game.roomUID,
        players: gamePlayers, gameText: game.getGameText(),
        state: game.getCurrentStateName(), themeVotingTime: THEME_SELECTION_TIME,countdownTime: COUNTDOWN_TIME,
        finishedToLobbyTime: FINISHED_TRANSITION_TO_LOBBY_TIME, isPrivateLobby: game.isPrivate, isLobbyLeader: game.creatorSocketID === socket.id
    });

}



