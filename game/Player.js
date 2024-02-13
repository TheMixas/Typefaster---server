import { v4 as uuidv4 } from 'uuid';
import Game from "./Game.js";
import {InProgressState, WaitingState} from "./GameState.js";

export default class Player {
    constructor(socket) {
        if(!socket) throw new Error("Socket is required");
        //Check that socket is a socket
        if(!socket.id) throw new Error("Socket must have an id");

        this.name =socket.user.username?? "Guest" + uuidv4().substring(0,4)
        this.socket = socket;
        //socket id is a unique id for each socket
        this.id = socket.id;

        //user id is a unique id for each registered user
        console.log("Player.js: socket.user: ", socket.user)
        this.userDBID = socket.user.id ?? null;


    }
    // Other methods
    /**
     * Gets the player's information.
     * @returns {Object} An object containing the player's ID and name.
     */

    //A player can only vote if they are in a game
    //A player can only vote if the game is in the waiting state
    //A player can only vote if they are the creator of the game IF the game is a private game
    voteForTheme(theme){
        if(!this.socket.game) return console.log("Player is not in a game");
        if(!(this.socket.game.state instanceof WaitingState)) return console.log("Game is not in waiting state, cant vote");
        let creatorsID = this.socket.game.creatorSocketID;
        let isPrivate = this.socket.game.isPrivate;
        if(isPrivate && creatorsID !== this.socket.id) return console.log("Only the creator of the game can vote for the theme in a private game");
        this.socket.game.voteForTheme(theme);
    }
    getInformation() {
        return {
            id: this.id,
            name: this.name};
    }
    //create js doc
    /*
    * @returns {int} The user id of the player in the database
     */
    getDBID(){
        return this.userDBID;
    }
    isGuest(){
        return this.userDBID === null;
    }


    sendCurrentWordIndex(index){

        if(!this.socket.game) throw new Error("Player is not in a game");
        if(!(this.socket.game.state instanceof InProgressState)) return;

        //index has to be a number
        if(isNaN(index)) {
            console.log("current word index is not a number");
            return;
        }
        console.log("@@@@@ sending current word index: ", index);

        this.socket.game.updatePlayerCurrentWordIndex(this.id,index);
    }


}