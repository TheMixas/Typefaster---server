import {pool} from "./database.js";
/**
 * Fetches the leaderboard data from the database.
 *
 * This function executes a SQL query to fetch the top 50 users based on their top words per minute (wpm), win rate, and total games played.
 * The win rate is calculated as the percentage of games where the user finished in the first position.
 * The data is then organized into a specific structure before being returned.
 *
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the organized leaderboard data.
 * The object has the following structure:
 * {
 *   wpm: Array<{ username: string, value: number }>,
 *   win_rate: Array<{ username: string, value: number }>,
 *   total_games: Array<{ username: string, value: number }>
 * }
 * Each array is sorted in descending order based on the value.
 * If there's an error executing the query, the promise resolves to null.
 *
 * @throws {Error} If there's an error executing the query, an error is logged to the console and the function returns null.
 */
export const GetLeaderboards = async () => {
    console.log("GetLeaderboards from db called");
    const query = `
        SELECT
            u.username,
            COALESCE(MAX(gs.user_wpm), 0) AS top_wpm,
            ROUND(COALESCE(SUM(CASE WHEN gs.user_position = 1 THEN 1 ELSE 0 END) / COUNT(gs.user_id) * 100.0, 0), 1) AS win_rate,
            COUNT(gs.user_id) AS total_games
        FROM
            users u
                LEFT JOIN
            game_stats gs ON u.id = gs.user_id
        GROUP BY
            u.id, u.username
        ORDER BY
            top_wpm DESC, win_rate DESC, total_games DESC
        LIMIT 50;
    `;

    try {
        const [result] = await pool.execute(query);

        const organizedData = organizeData(result);

        return organizedData;
    } catch (error) {
        console.error('Error executing query in GetProfile:', error);
        return null;
    }
}
// Function to organize data into the desired structure
function organizeData(data) {
    // Convert win_rate to number
    data.forEach(user => user.win_rate = parseFloat(user.win_rate));

    // Sort the data based on top_wpm in descending order
    const wpmSorted = [...data].sort((a, b) => b.top_wpm - a.top_wpm);
    const winRateSorted = [...data].sort((a, b) => b.win_rate - a.win_rate);
    const totalGamesSorted = [...data].sort((a, b) => b.total_games - a.total_games);

    const organizedData = {
        wpm: wpmSorted.map(user => ({ username: user.username, value: user.top_wpm })),
        win_rate: winRateSorted.map(user => ({ username: user.username, value: user.win_rate })),
        total_games: totalGamesSorted.map(user => ({ username: user.username, value: user.total_games }))
    };

    return organizedData;
}