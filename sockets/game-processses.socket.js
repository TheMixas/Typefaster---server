import {io} from "../index.js";
import {Events} from "../events.js";

export const handleEmitGameEndedToRoom = (game) => {
    if(!game){
        throw new Error("No game provided");
    }
    if(!game.roomUID){
        throw new Error("No game.roomUID provided");
    }
    console.log("Emitting SERVER_GAME_ENDED to players in room: ", game.roomUID)
    console.log("game players: ", game.getPlayers())
    //for each player, send game ended + playerWon

    io.to(game.roomUID).emit(Events.SERVER_GAME_ENDED, {playerWonID:game.winners[0]});
}