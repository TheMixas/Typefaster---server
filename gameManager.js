import Game from "./game/Game.js";


let games = {};


/**
 * Gets all the games.
 * @returns {{}} An object containing all the games.
 */
export function getGames() {
    return games;
}

/**
 * Gets a game by its UID.
 * @param gameUID
 * @returns {Game}
 * @throws Error if the game does not exist.
 */
export function getGame(gameUID) {
    console.log("gameUID: ",gameUID);
    if(!games[gameUID]) {
        console.log("Game does not exist")
        return null;
    };
    return games[gameUID];
}

/**
 * Removes a game from the games object.
 * @param gameUID
 */
export function removeGame(gameUID) {
    games[gameUID].cleanup();
    delete games[gameUID];
    console.log("Game removed: ", gameUID);
    console.log("Remaining games: ", games);
}

/**
 * Finds a public lobby with the most players.
 * @returns {Game} The game with the most players, or null if no public lobbies exist.
 */
export function findPublicLobbyWithMostPlayers() {
    let mostPlayers = 0;
    let lobbyWithMostPlayers = null;
    for (const game in games) {
        // Skip private games
        if (games[game].isPrivate) continue;
        // Skip games that are not in the lobby state
        if(!games[game].isGameInLobbyState()) continue;

        if (games[game].getPlayers().length >= mostPlayers) {
            mostPlayers = games[game].getPlayers().length;
            lobbyWithMostPlayers = getGames()[game];

        }
    }
    return lobbyWithMostPlayers;
}

/**
 * Creates a new game room.
 * @param {boolean} [isPrivate=false] - Whether the new room should be private.
 * @param creatorSocketID
 * @returns {Game} The newly created game.
 */
export function createNewRoom(isPrivate = false, creatorSocketID = null) {
    console.log("Creating new room, isPrivate: ", isPrivate);
    // Implementation
    const game = new Game(isPrivate, creatorSocketID)
    games[game.roomUID] = game;
    return game;
}

export function getPlayerFromRoomUID(roomUID,socket){

    let game = getGame(roomUID);
   return game.getPlayer(socket.id);
}

