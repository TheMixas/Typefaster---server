import {io} from "../index.js";
import {Events} from "../events.js";
import {
    CALCULATE_PLAYER_POSITIONS_INTERVAL,
    COUNTDOWN_TIME,
    FINISHED_TRANSITION_TO_LOBBY_TIME,
    GAME_TIME,
    LOBBY_TRANSITION_TO_COUNTDOWN_TIME,
    REQUEST_CURRENT_TEXT_INTERVAL,
    SEND_PLAYER_POSITIONS_INTERVAL,
    THEME_SELECTION_TIME
} from "../constants.js";
import {ChopSentence} from "../utils/text-utils.js";
import {handleEmitGameEndedToRoom} from "../sockets/game-processses.socket.js";

export class GameState {
    constructor(game) {
        if (new.target === GameState) {
            throw new Error("Cannot instantiate an abstract class.");
        }
       //generate and set a random id
        console.log("GameState constructor called, gameState: ", this.constructor.name)

        this.id = Math.floor(Math.random() * 1000000000);
        if(!game) throw new Error("Game must be provided");
        this.timer = null;
        this.intervalTimers = [];
        this.game = game;
        this.initiateState()

    }

    // Transitions to the next state
    initiateState() {
        throw new Error("This method must be overwritten!");

    }
    transitionState() {
        throw new Error("This method must be overwritten!");
    }
    /**
     * Cleans up the game state by clearing all timers.
     * This method should be called when the game ends abruptly to prevent any potential issues caused by lingering timers.
     */
    cleanup() {
        this.clearTimer();
        this.clearAllIntervalTimers();

    }


    clearAllIntervalTimers() {
        for (const intervalTimer of this.intervalTimers) {
            clearInterval(intervalTimer);
        }
        this.intervalTimers = [];
    }
    clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
//Waits for players to join or request to start
export class WaitingState extends GameState {
    initiateState() {
        console.log("waiting state")
    }
    transitionState() {

        this.clearTimer();
        this.game.setState(new ThemeSelectionState (this.game));
    }
}
export class ThemeSelectionState extends GameState {
    initiateState() {
        console.log("theme selection state")
        this.timer=setTimeout(()=>this.transitionState(),THEME_SELECTION_TIME*1000)
    }
    transitionState(){
        this.clearTimer();
        this.game.setThemeBasedOnVotes()
        this.game.generateText();
        io.to(this.game.roomUID).emit(Events.SERVER_SENDS_GAME_TEXT, {gameText: this.game.text});
        this.game.setState(new CountDownState(this.game))
    }
}

export class CountDownState extends GameState{
    initiateState() {
        //sEND COUNTDOWN
        console.log("countdown state")
        this.timer=setTimeout(()=>this.transitionState(),COUNTDOWN_TIME*1000)
    }
    transitionState(){
        this.clearTimer();
        console.log("transitioning to in progress state")
        this.game.setState(new InProgressState(this.game))
    }
}

export class InProgressState extends GameState {


    //change to new method
    calculatePlayerPositions() {
        if (!this.game.text) {
            console.log("no game text")
            return;
        }
        if(this.game.text.length === 0) {
            console.log("game text length is 0")
            return;
        }

        let players = this.game.getPlayers();
        let playerPositions = {};
        let gameTextWordCount = ChopSentence(this.game.text).length;
        console.log("game text word count: ", gameTextWordCount)
        let i =0

        //appennd wpm, progress to player positions
        for (const player of players) {
            let percentage = (this.game.getPlayerCurrentWordIndexes()[player.id] / gameTextWordCount) * 100;
            //if percentage is NaN, set to 0 instead
            if(isNaN(percentage)) percentage = 0;
            //set wwords per minute
            //dotn change wpm if player ocmpleted the text
            if(percentage < 100) {
                let wpm = this.game.getPlayerCurrentWordIndexes()[player.id] / this.game.getElapsedTime();
                console.log("GameState.js: wpm: ", wpm)
                playerPositions[player.id] = {progress:percentage,wpm};

            }else{
                playerPositions[player.id] = {progress:percentage};
            }
            i++;
        }
        //apend player positions to game\

        //playerPositions = {playerID: {progress: 0, wpm: 0}, playerID: {progress: 0, wpm: 0}}
        //comments: bad naming, should be called playerStats

        //list of game player sockets
        let gamePlayerSockets = Object.keys(playerPositions);
        console.log("GameState.js: gamePlayerSockets: ", gamePlayerSockets)
        //sort this array where the player with the highest progress is first
        gamePlayerSockets.sort((a, b) => playerPositions[b].progress - playerPositions[a].progress);
        console.log("GameState.js: sorted gamePlayerSockets: ", gamePlayerSockets)
        //set player positions (1st, 2nd, 3rd, 4th, etc)
        for(let i = 0; i < gamePlayerSockets.length; i++){
            let playerID = gamePlayerSockets[i];
            playerPositions[playerID].position = i+1;
        }
            console.log("GameState.js: playerPositions after setting player pos: ", playerPositions)

        this.game.setPlayerPositions(playerPositions);
        console.log("player positions after calcs: ", this.game.getPlayerPositions())
    }
    initiateState() {
        console.log("in progress state")
        io.to(this.game.roomUID).emit(Events.SERVER_GAME_STARTED);
        //Request players texts
        this.reqCurrTextInterval = setInterval(() => {
            io.to(this.game.roomUID).emit(Events.SERVER_WANTS_CURRENT_TEXT)
        }, REQUEST_CURRENT_TEXT_INTERVAL * 1000);
        this.intervalTimers.push(this.reqCurrTextInterval);
        //Calculate player positions
        this.calculatePlayerPositionsInterval = setInterval(() => {
            this.calculatePlayerPositions();
        }, CALCULATE_PLAYER_POSITIONS_INTERVAL * 1000)
        this.intervalTimers.push(this.calculatePlayerPositionsInterval);
        //Send player positions
        this.sendPlayerPositionsInterval = setInterval(() => {
            sendPlayerPositions(this.game)
        }, SEND_PLAYER_POSITIONS_INTERVAL * 1000)
        this.intervalTimers.push(this.sendPlayerPositionsInterval);

        this.timer = setTimeout(() => this.transitionState(), GAME_TIME * 1000); // Transition to FinishedState after 60 seconds

    }

    transitionState() {
        this.cleanup();
        this.game.setState(new FinishedState(this.game));
    }
}

export class FinishedState extends GameState {

    initiateState() {
        //calculate winners
        this.game.calculateSoloWinner();

        //save game stats to db
        this.game.saveFinishedGame()


        handleEmitGameEndedToRoom(this.game);


        //Send player positions
        sendPlayerPositions(this.game);
        console.log("finished state")

        this.timer = setTimeout(() => this.transitionState(), FINISHED_TRANSITION_TO_LOBBY_TIME * 1000); // Transition to FinishedState after 60 seconds

    }
    transitionState() {
        this.game.resetGame()
    }
}
const sendPlayerPositions = (game) => {
    let playerPositions = game.getPlayerPositions();
    console.log("sending player positions for game: ", game.roomUID, " positions: ", playerPositions)
    io.to(game.roomUID).emit(Events.SERVER_SENDS_PLAYER_POSITIONS, {playerPositions});
}
