// events.js
export const Events = {
    /**
     * Event emitted by the server when the game state changes.
     * @event SERVER_GAME_STATE_CHANGED
     * @type {string}
     */
    SERVER_GAME_STATE_CHANGED: 'gameStateChanged',
    /**
     * Event emitted by the server when it wants the current text.
     * @event SERVER_WANTS_CURRENT_TEXT
     * @type {string}
     */
    SERVER_WANTS_CURRENT_TEXT: 'requestCurrentText',
    /**
     * Event emitted by the server when a client has joined a game.
     * @returns {Object} The game the client joined and the players in the game.
     * @property{string} gameUID - The UID of the game the client joined.
     * @property{Object[]} players - The info of players in the game.
     * @event SERVER_JOINED_GAME
     * @type {string}
     */

    SERVER_JOINED_GAME: 'joinedGame',
    /**
     * Event emitted by the server when it sends tHE GAME TEXTT
     *
     */
    SERVER_SENDS_GAME_TEXT: 'serverSendsGameText',
    /**
     * Event emitted by the server when a player has joined the game.
     * @returns {Object} The info of the player that joined the game.
     * @property{string} username - The username of the player that joined the game.
     * @property{string} socketID - The socket ID of the player that joined the game.
     * @event SERVER_PLAYER_JOINED
     * @type {string}
     */
    SERVER_PLAYER_JOINED: 'playerJoined',
    /**
     * Event emitted by the server when a player has left the game.
     * @returns {Object} The info of the player that left the game.
     * @property{string} player - The socket ID of the player that left the game.
     * @event SERVER_PLAYER_LEFT
     * @type {string}
     */
    SERVER_PLAYER_LEFT: 'playerLeft',

    /**
     * Event emitted by the server when it wants to reset the game.
     * @event SERVER_RESET_GAME
     * @type {string}
     */
    SERVER_RESET_GAME: 'resetGame',
    /**
     * Event emitted by the server when the game has started.
     * @event SERVER_GAME_STARTED
     */
    SERVER_GAME_STARTED: 'gameStarted',

    /**
     * Event emitted by the server when the game has ended.
     * @event SERVER_GAME_ENDED
     */
    SERVER_GAME_ENDED: 'gameEnded',
    /**
     * Event emitted by the server when a user has voted for a genre.
     * @returns {Object} The votes for each genre.
     * */
    SERVER_GENRE_VOTES_UPDATED: 'genreVotingsUpdated',

    /**
     * Event emitted by the server when it sends the positions of all players in the game.
     * @returns {Object} The positions of all players in the game.
     * @property{Object} playerPositions - The positions of all players in the game. The key is the player ID and the value is the percentage of the text they have completed with no mistakes.
     * @event SERVER_SENDS_PLAYER_POSITIONS
     */
    SERVER_SENDS_PLAYER_POSITIONS: 'sendPlayerPositions',

    /**
     * Event emitted by the client when it sends the current text requested by the server.
     * @event CLIENT_SENDS_WANTED_CURRENT_TEXT
     * @type {string}
     */
    CLIENT_SENDS_WANTED_CURRENT_TEXT: 'sendRequestedCurrentText',

    /**
     * Event emitted by the client when it wants to play.
     * @event CLIENT_WANTS_PLAY
     * @type {string}
     */
    CLIENT_WANTS_PLAY: 'clientWantsPlay',
    /**
     * Event emitted by the client when it wants to join a player created game.
     * @event CLIENT_WANTS_PAUSE
     * @type {string}
     */
    CLIENT_WANTS_JOIN_GAME: 'clientWantsJoinGame',

    /**
     * Event emitted by the client when it wants to create a game.
     * @event CLIENT_WANTS_CREATE_GAME
     * @type {string}
     */
    CLIENT_WANTS_CREATE_GAME: 'clientWantsCreateGame',
    /**
     * Event emitted by the client when it wants to Start a game.
     * @event CLIENT_WANTS_START_GAME
     * @type {string}
     */
    CLIENT_WANTS_START_GAME: 'clientWantsStartGame',

    /**
     * Event emitted by the client when iT VOTED FOR A GENRE
     */
    CLIENT_SENDS_GENRE_VOTE: 'clientSendsGenreVote',
    /**
     * Event emitted by the CREATOR client when it wants to pick a genre
     */
    CLIENT_CREATOR_PICKS_GENRE: 'clientCreatorPicksGenre',
    /**
     * Event emitted by the client when it sends a mistake array
     * Created with sending the mistake array in response to SERVER_GAME_STATE_CHANGED event where state = finished
     */
    CLIENT_SENDS_MISTAKE_ARRAY: 'clientSendsMistakeArray',




};