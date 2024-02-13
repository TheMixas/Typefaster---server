//Functions for handling the voting for the genre
import { Events } from './../events.js';
import { io } from './../index.js';



export function handleClientVoteForGenre(socket, theme, cb) {
    try {
        console.log("socket.id on vote: ", socket.id);
        if(!socket.player) throw new Error("Socket has no player");
        if(!socket.game) throw new Error("Socket has no game");

        //update votes
        socket.game.addThemeVote(theme, socket.id);

        //emit from io
        io.to(socket.game.roomUID).emit(Events.SERVER_GENRE_VOTES_UPDATED, {themeVotes:socket.game.getThemeVotes()});

        //Let the clients know that the genre has been voted for
        cb({success: true})
    } catch (e) {
        cb({success: false, error: e.message});
        console.log("Error when handling client vote for genre: ", e.message);
    }
}