import { io } from './../index.js';

import { v4 as uuidv4 } from 'uuid';
import { Events } from '../events.js';
import {WaitingState, GameState, CountDownState, ThemeSelectionState} from './GameState.js';
import Player from "./Player.js";
import {removeGame} from "../gameManager.js";
import {GetRandomTextBasedOnTheme} from "../utils/text-utils.js";
import texts from "../texts.js";
import {COUNTDOWN_TIME, PLAYERS_NEEDED_TO_START} from "../constants.js";
import {createGame, createGameStats} from "../db/game-db.js";




export default class Game {
    constructor(isPrivate, creatorSocketID=null){
        //[Player]
        this.players = [];
        // {theme: numberOfVotes}
        // Initialised with 0 votes for each theme
        console.log("texts: ", texts);
        this.themeVotes = Object.keys(texts).reduce((acc, theme) => {
            acc[theme] = [];
            return acc;
        }, {});
        this.theme = "Default";
        this.text= 'l';
        this.state = new WaitingState(this);
        this.roomUID = uuidv4(); // Generate a random room name
        this.isPrivate = isPrivate;
        //For public games, a game can be force started only if there is only one player in it,
        // for games start this way, disable certain stats gained.
        this.isSinglePlayer = false;
        this.roomPassword = isPrivate ? uuidv4() : null;
        //{soscketid:{progress}}
        this.playerPositions = {}
        //{socketid: currentWordIndex}
        this.playerCurrentWordIndexes = {}
        //Used for private lobbies
        this.creatorSocketID = creatorSocketID

        this.startTime = null;

        //An array, in case I wanted to do teams mode
        this.winners = [];
    }

    setIsSinglePlayer(bool){
        this.isSinglePlayer = bool;
    }
    getCurrentStateName(){
        return this.state.constructor.name;
    }
    removeThemeVote(theme, socketID){
        if(!socketID) throw new Error("No socketID provided")
        //remove old vote
        Object.keys(this.themeVotes).forEach((key) => {
            this.themeVotes[key] = this.themeVotes[key].filter((id) => id !== socketID);
        });
    }

    //Adds a vote for a theme
    //If its undefined or non existant, vote added to default theme
    addThemeVote(theme, socketID){
        if(!socketID) throw new Error("No socketID provided")
        if(!this.canReceiveThemeVotes()) throw new Error("Game cannot receive theme votes")
        //remove old vote
        this.removeThemeVote(theme, socketID)

        //add new vote
        //if theme is undefined or doesnt eit, add vote to default theme
        if(!theme || texts[theme] === undefined){
            this.themeVotes['Default'].push(socketID);
        }
        else{
            this.themeVotes[theme].push(socketID);
        }
    }
    getThemeVotes(){
        let votes = Object.keys(this.themeVotes).reduce((acc, theme) => {
            acc[theme] = this.themeVotes[theme].length;
            return acc;
        }, {})
        console.log("votes: ", votes);
        return votes;
    }

    setThemeBasedOnVotes(){
        let votes = this.getThemeVotes();
        let maxVotes = -Infinity;
        let maxVotesTheme = null;
        Object.keys(votes).forEach((key) => {
            if(votes[key] > maxVotes){
                maxVotes = votes[key];
                maxVotesTheme = key;
            }
        });
        this.setTheme(maxVotesTheme);
    }

    setTheme(theme){
        this.theme = theme;
    }
    //Generates text based on theme
    generateText(){
        this.text = GetRandomTextBasedOnTheme(this.theme) ?? "Kukubezdis";
    }
    getGameText(){
        return this.text;
    }


    /**
     * Adds a player to the game.
     * @param {Player} player - The player to add.
     * @throws {Error} If the player is not an instance of Player.
     */
    addPlayer(player){
        if (!(player instanceof Player)) {
            throw new Error('Invalid player object.');
        }
        this.players.push(player);
    }
    /**
     * Removes a player from the game.
     * @param playerSocketID - The socket ID of the player to remove.
     */
    removePlayer(playerSocketID){
        this.players = this.players.filter(p => p.socket.id !== playerSocketID);

        //remove their vote
        this.removeThemeVote(this.theme, playerSocketID)

        //remove their progress
        let newPositions = this.getPlayerPositions()
        delete newPositions[playerSocketID]
        this.setPlayerPositions(newPositions)

        //stop game from starting in case there are not enough players and game hasnt started yet
        if(this.players.length < PLAYERS_NEEDED_TO_START &&
            (
                this.state instanceof WaitingState ||
                this.state instanceof CountDownState ||
                this.state instanceof ThemeSelectionState
            )){
            this.resetGame();
        }

        if(this.players.length === 0){
            removeGame(this.roomUID)
        }
    }

    /**
     * Retrieves a player from the game based on their socket id.
     * @returns {Player} The player with the matching socket ID, or undefined if no player is found.
     * @param socketID
     */
    getPlayer(socketID){
        return this.players.find(p => p.socket.id === socketID);
    }

    /**
     * Checks if a player is already in the game based on their ID.
     * @param {string} id - The ID of the player to check.
     * @returns {boolean} True if a player with the matching ID is found, false otherwise.
     */
    hasPlayer(id){
        return this.players.some(p => p.id === id);
    }
    getPlayers(){
        return this.players;
    }
    /**
     * Gets the information of all players in the game.
     * @returns {Object} An object containing an array of player information. Each player's information includes their ID and name.
     */
    getAllPlayersInfo(){
        return this.players.map(p => p.getInformation())
    }
    //Returns the amount of players in the game
    getPlayerCount(){
        return this.players.length;
    }
    //Returns an object of structure {socketID: currentWordIndex}
    //It is sorted by currentWordIndex
    getPlayerPositions(){
        return this.playerPositions;
    }

    getPlayerPosition(playerID){
        return this.playerPositions[playerID]?.position;
    }
    getPlayerWPM(playerID){
        console.log("playerPositions before getting player wpm: ", this.playerPositions)
        return this.playerPositions[playerID]?.wpm;
    }
    setPlayerPositions(positions){
        this.playerPositions = {...this.playerPositions, ...positions};
    }
    getPlayerCurrentWordIndexes(){
        return this.playerCurrentWordIndexes;
    }
    setPlayerCurrentWordIndexes(indexes){
        this.playerCurrentWordIndexes = indexes;
    }
    updatePlayerCurrentWordIndex(playerID, currentWordIndex) {

        let newIndexes = this.getPlayerCurrentWordIndexes()
        newIndexes[playerID] = currentWordIndex
        this.setPlayerCurrentWordIndexes(newIndexes)
        console.log("updated player current WordIndexes ", this.getPlayerCurrentWordIndexes())
    }

    calculateSoloWinner(){
        //check playerPositions object
        //set max progress to negative infinity
        let maxProgress = -Infinity;
        let maxProgressPlayerID = null;
        Object.keys(this.playerPositions).forEach((key) => {
            if(this.playerPositions[key].progress > maxProgress){
                maxProgress = this.playerPositions[key].progress;
                maxProgressPlayerID = key;
            }
        });
        this.winners = [maxProgressPlayerID]
        console.log("solo winner: ", this.winners)
    }
    hasPlayerWon(playerID){
        console.log("this.winners: ", this.winners)
        console.log(`player of id ${playerID} is in winners: `, this.winners.includes(playerID))
        return this.winners.includes(playerID);
    }


    /*
        * Checks if the game is in the lobby state (WaitingState)
        * Returns true if it is, false otherwise
        * */
    isGameInLobbyState(){
        return this.state instanceof WaitingState;
    }

    /*
    * Checks if the game is in the countdown state (CountDownState)
    * Returns true if it is, false otherwise
     */
    canReceiveThemeVotes(){
        return this.state instanceof ThemeSelectionState || this.state instanceof WaitingState;
    }
    setState(state){
        if (!(state instanceof GameState)) {
            throw new Error('Invalid state.');
        }
        this.state = state;
        io.to(this.roomUID).emit(Events.SERVER_GAME_STATE_CHANGED,
            { state: this.state.constructor.name });
    }

    // Starts the game by transitioning to the CountDownState
    startGame(){
        console.log("Game.startGame() called")
        if(this.state instanceof WaitingState){
            this.state.transitionState(this);
            console.log(`Started a ${this.isSinglePlayer ? "single player" : "multiplayer"} game`)
        }
        //set timer for wpm calculation
        this.startTime = Date.now();
    }

    //Start game if there are enough players
    attemptStartGame(){
        if(this.players.length >= PLAYERS_NEEDED_TO_START){
            this.startGame();
        }
    }

    // Ends the game by transitioning to the FinishedState
    endGame(){
        this.state.transitionState(this);
    }

    // Resets the game by transitioning back to the WaitingState
    resetGame(){
        this.cleanup();
        this.setPlayerPositions({});

        //generate new text
        this.generateText();

        //reset isSinglePlayer
        this.setIsSinglePlayer(false);

        this.setState(new WaitingState(this));

        //emit event to client to reset
        console.log("emitting reset game")
        io.to(this.roomUID).emit(Events.SERVER_RESET_GAME, {gameText: this.text});
        this.attemptStartGame()

    }

    cleanup(){
        if(this.state instanceof GameState){
            this.state.cleanup()
        }
        else {
            console.error("Invalid state. Cannot cleanup the state.")
        }
    }

    //time
    getElapsedTime(){
        return (Date.now() - this.startTime) / 60000; // convert milliseconds to minutes
    }


    //Database
    saveFinishedGame(){
        try{
            //create game
            createGame(this.theme, this.isSinglePlayer).then((gameID) => {
                    //create game stats for each player
                    this.players.forEach((player) => {
                        if(player.isGuest()){
                            console.log("Player is guest, not saving stats")
                            return;
                        }
                        let playerWPM = this.playerPositions[player.id].wpm ?? 1;
                        createGameStats(gameID, player.getDBID(), this.playerPositions[player.id].position ?? 69, playerWPM,0)
                    })
            })


        }catch (e) {
            console.error("Error saving game: ", e)
        }

    }


}