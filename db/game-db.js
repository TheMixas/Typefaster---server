import {pool} from "./database.js";
/*
* <h2>Function: createGame</h2>
<p>This function is part of the game database operations. It creates a new game in the database with the provided text theme.</p>

<h3>Parameters:</h3>
<ul>
  <li><b>textTheme:</b> The theme of the text for the game to create.</li>
</ul>

<h3>Operation:</h3>
<p>The function executes a SQL query using the mysql2 package, which automatically escapes query values to prevent SQL injection. It inserts a new row into the games table with the provided text theme, and returns the ID of the newly created game.</p>

<h3>Typical Use:</h3>
<p>This function is typically used in the game creation process to create a new game in the database with a specific text theme. Typically called at the end of the game.</p>
*/
export const createGame = async (textTheme,isSinglePlayer) => {
    const [result] = await pool.execute('INSERT INTO games (text_theme, is_single_player) VALUES (?,?)', [textTheme,isSinglePlayer]);
    return result.insertId;
}


/*
* <h2>Function: createGameStats</h2>
<p>This function is part of the game database operations. It creates a new game statistics record in the database with the provided game ID, player ID, player position, words per minute (WPM), and accuracy.</p>

<h3>Parameters:</h3>
<ul>
  <li><b>gameID:</b> The ID of the game for which the statistics are being recorded.</li>
  <li><b>playerID:</b> The ID of the player for whom the statistics are being recorded.</li>
  <li><b>playerPosition:</b> The final position of the player in the game.</li>
  <li><b>playerWPM:</b> The words per minute rate of the player in the game.</li>
  <li><b>playerAccuracy:</b> The accuracy of the player in the game.</li>
</ul>

<h3>Operation:</h3>
<p>The function executes a SQL query using the mysql2 package, which automatically escapes query values to prevent SQL injection. It inserts a new row into the game_stats table with the provided game ID, player ID, player position, words per minute (WPM), and accuracy, and returns the ID of the newly created game statistics record.</p>

<h3>Typical Use:</h3>
<p>This function is typically used at the end of a game to record the game statistics for a player.</p>
*/
export const createGameStats = async (gameID,playerID,playerPosition,playerWPM,playerAccuracy) => {
    const [result] = await pool.execute('INSERT INTO game_stats (game_id,user_id,user_position,user_wpm,user_accuracy) VALUES (?,?,?,?,?)', [gameID,playerID,playerPosition,playerWPM,playerAccuracy]);
    return result.insertId;
}